import pool from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import {
  createOrder,
  createOrderItem,
  deleteCartItems,
  findOrderById,
  findOrderItems,
  listUserOrders,
} from '../models/orderModel.js';
import { findOrCreateCart, findCartItems } from '../models/cartModel.js';
import { findProductById } from '../models/productModel.js';
import { findUserById } from '../models/userModel.js';
import { sendOrderConfirmationEmail } from './emailService.js';

export const createUserOrder = async (userId, input) => {
  const shippingName = input.shippingName?.trim();
  const shippingAddress = input.shippingAddress?.trim();
  const shippingCity = input.shippingCity?.trim();
  const shippingZip = input.shippingZip?.trim();
  const shippingPhone = input.shippingPhone?.trim();

  if (!shippingName || !shippingAddress || !shippingCity || !shippingZip || !shippingPhone) {
    throw new ApiError(400, 'La información de envío es obligatoria.');
  }

  const cart = await findOrCreateCart(pool, userId);
  const cartItems = await findCartItems(pool, cart.id);

  if (!cartItems.length) {
    throw new ApiError(400, 'Tu carrito está vacío.');
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const user = await findUserById(pool, userId);

  if (!user) {
    throw new ApiError(401, 'La cuenta asociada a esta sesión no existe.');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const order = await createOrder(connection, userId, {
      total,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingZip,
      shippingPhone,
    });

    for (const item of cartItems) {
      const product = await findProductById(connection, item.id);
      if (!product) {
        throw new ApiError(404, `El producto "${item.name}" ya no existe.`);
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        throw new ApiError(400, 'La cantidad de un producto no es válida.');
      }

      if (product.stock < quantity) {
        throw new ApiError(409, 'Stock insuficiente para uno o más productos.');
      }

      const [updateResult] = await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [quantity, product.id, quantity]
      );

      if (!updateResult.affectedRows) {
        throw new ApiError(409, 'Stock insuficiente para uno o más productos.');
      }

      await createOrderItem(connection, order.id, item.id, item.quantity, item.price);
    }

    await deleteCartItems(connection, cart.id);

    const items = await findOrderItems(connection, order.id);
    const fullOrder = await findOrderById(connection, order.id, userId);
    await connection.commit();

    const normalizedUser = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };

    sendOrderConfirmationEmail(fullOrder, normalizedUser, items).catch((error) => {
      console.error('No fue posible enviar el correo de confirmación de compra:', error);
    });

    return { ...fullOrder, items };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserOrder = async (userId, orderId) => {
  const id = Number(orderId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'El identificador de la orden no es válido.');
  }

  const order = await findOrderById(pool, id, userId);
  if (!order) {
    throw new ApiError(404, 'La orden no existe.');
  }

  const items = await findOrderItems(pool, id);
  return { ...order, items };
};

export const getUserOrders = async (userId) => {
  return listUserOrders(pool, userId);
};

export const cancelUserOrder = async (userId, orderId) => {
  const id = Number(orderId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'El identificador de la orden no es válido.');
  }

  const order = await findOrderById(pool, id, userId);
  if (!order) {
    throw new ApiError(404, 'La orden no existe.');
  }

  if (order.status !== 'pending') {
    throw new ApiError(409, 'Solo puedes cancelar órdenes en estado pendiente.');
  }

  const [result] = await pool.execute(
    'UPDATE orders SET status = ? WHERE id = ? AND user_id = ?',
    ['cancelled', id, userId]
  );

  if (!result.affectedRows) {
    throw new ApiError(404, 'La orden no existe.');
  }

  return { id, status: 'cancelled' };
};

export const deleteUserOrder = async (userId, orderId) => {
  const id = Number(orderId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'El identificador de la orden no es válido.');
  }

  const order = await findOrderById(pool, id, userId);
  if (!order) {
    throw new ApiError(404, 'La orden no existe.');
  }

  if (order.status !== 'pending') {
    throw new ApiError(409, 'Solo puedes eliminar órdenes en estado pendiente.');
  }

  const [result] = await pool.execute(
    'DELETE FROM orders WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (!result.affectedRows) {
    throw new ApiError(404, 'La orden no existe.');
  }

  return { id, deleted: true };
};
