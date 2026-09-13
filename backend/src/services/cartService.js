import pool from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { findProductById } from '../models/productModel.js';
import {
  addCartItem,
  deleteCartItem,
  findCartItems,
  findOrCreateCart,
  updateCartItemQuantity,
} from '../models/cartModel.js';

const parseProductId = (value) => {
  const productId = Number(value);
  if (!Number.isInteger(productId) || productId < 1) {
    throw new ApiError(400, 'El identificador del producto no es válido.');
  }
  return productId;
};

const parseQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    throw new ApiError(400, 'La cantidad debe ser un entero entre 1 y 999.');
  }
  return quantity;
};

const getCartItems = async (executor, userId) => {
  const cart = await findOrCreateCart(executor, userId);
  return findCartItems(executor, cart.id);
};

export const getUserCart = (userId) => getCartItems(pool, userId);

export const addItemToCart = async (userId, input) => {
  const productId = parseProductId(input.productId);
  const quantity = parseQuantity(input.quantity);
  const product = await findProductById(pool, productId);

  if (!product) {
    throw new ApiError(404, 'El producto no existe.');
  }

  if (product.stock < quantity) {
    throw new ApiError(409, 'Stock insuficiente para el producto seleccionado.');
  }

  const cart = await findOrCreateCart(pool, userId);
  await addCartItem(pool, cart.id, productId, quantity);
  return findCartItems(pool, cart.id);
};

export const setCartItemQuantity = async (userId, productIdInput, input) => {
  const productId = parseProductId(productIdInput);
  const quantity = parseQuantity(input.quantity);
  const product = await findProductById(pool, productId);

  if (!product) {
    throw new ApiError(404, 'El producto no existe.');
  }

  if (product.stock < quantity) {
    throw new ApiError(409, 'Stock insuficiente para el producto seleccionado.');
  }

  const cart = await findOrCreateCart(pool, userId);
  const updated = await updateCartItemQuantity(pool, cart.id, productId, quantity);

  if (!updated) {
    throw new ApiError(404, 'El producto no está en tu carrito.');
  }

  return findCartItems(pool, cart.id);
};

export const removeItemFromCart = async (userId, productIdInput) => {
  const productId = parseProductId(productIdInput);
  const cart = await findOrCreateCart(pool, userId);
  const deleted = await deleteCartItem(pool, cart.id, productId);

  if (!deleted) {
    throw new ApiError(404, 'El producto no está en tu carrito.');
  }

  return findCartItems(pool, cart.id);
};

export const mergeGuestCart = async (userId, input) => {
  if (!Array.isArray(input.items) || input.items.length > 100) {
    throw new ApiError(400, 'El carrito de invitado no tiene un formato válido.');
  }

  const mergedItems = new Map();
  for (const item of input.items) {
    const productId = parseProductId(item.productId ?? item.id);
    const quantity = parseQuantity(item.quantity);
    const nextQuantity = (mergedItems.get(productId) || 0) + quantity;

    if (nextQuantity > 999) {
      throw new ApiError(400, 'La cantidad total de un producto no puede superar 999.');
    }

    mergedItems.set(productId, nextQuantity);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const cart = await findOrCreateCart(connection, userId);

    for (const [productId, quantity] of mergedItems) {
      const product = await findProductById(connection, productId);
      if (!product) {
        throw new ApiError(404, `El producto con id ${productId} ya no existe.`);
      }
      await addCartItem(connection, cart.id, productId, quantity);
    }

    const items = await findCartItems(connection, cart.id);
    await connection.commit();
    return items;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
