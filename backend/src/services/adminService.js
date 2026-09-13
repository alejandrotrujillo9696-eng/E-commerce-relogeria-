import pool from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import {
  createCategory,
  deleteCategory,
  findCategoryById,
  updateCategory,
} from '../models/categoryModel.js';
import {
  createProduct,
  deleteProduct,
  findProductById,
  updateProduct,
} from '../models/productModel.js';
import {
  deleteUser,
  findUserById,
  listUsers,
  updateUserRole,
} from '../models/userModel.js';
import { findOrderByIdAdmin, findOrderItems, listAllOrders } from '../models/orderModel.js';
import { deleteOrder } from '../models/orderModel.js';

const parseId = (value, name) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, `${name} no es válido.`);
  }
  return id;
};

export const adminCreateProduct = async (product) => {
  const required = ['name', 'description', 'price', 'imageUrl', 'categoryId'];
  for (const field of required) {
    if (product[field] === undefined || product[field] === null || String(product[field]).trim() === '') {
      throw new ApiError(400, `El campo ${field} es obligatorio.`);
    }
  }

  const price = Number(product.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError(400, 'El precio debe ser un número mayor o igual a cero.');
  }

  const stock = Number(product.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new ApiError(400, 'El stock debe ser un entero mayor o igual a cero.');
  }

  const categoryId = Number(product.categoryId);
  if (!Number.isInteger(categoryId) || categoryId < 1) {
    throw new ApiError(400, 'La categoría no es válida.');
  }

  const category = await findCategoryById(pool, categoryId);
  if (!category) {
    throw new ApiError(400, 'La categoría no existe.');
  }

  return createProduct(pool, {
    name: String(product.name).trim(),
    description: String(product.description).trim(),
    price,
    imageUrl: String(product.imageUrl).trim(),
    categoryId,
    stock,
  });
};

export const adminUpdateProduct = async (productId, product) => {
  const id = parseId(productId, 'El identificador del producto');
  const existing = await findProductById(pool, id);
  if (!existing) {
    throw new ApiError(404, 'El producto no existe.');
  }

  const price = Number(product.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError(400, 'El precio debe ser un número mayor o igual a cero.');
  }

  const stock = Number(product.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new ApiError(400, 'El stock debe ser un entero mayor o igual a cero.');
  }

  const categoryId = Number(product.categoryId);
  if (!Number.isInteger(categoryId) || categoryId < 1) {
    throw new ApiError(400, 'La categoría no es válida.');
  }

  const category = await findCategoryById(pool, categoryId);
  if (!category) {
    throw new ApiError(400, 'La categoría no existe.');
  }

  await updateProduct(pool, id, {
    name: String(product.name).trim(),
    description: String(product.description).trim(),
    price,
    imageUrl: String(product.imageUrl).trim(),
    categoryId,
    stock,
  });

  return findProductById(pool, id);
};

export const adminDeleteProduct = async (productId) => {
  const id = parseId(productId, 'El identificador del producto');
  const existing = await findProductById(pool, id);
  if (!existing) {
    throw new ApiError(404, 'El producto no existe.');
  }
  await deleteProduct(pool, id);
  return { id };
};

export const adminCreateCategory = async (name) => {
  const trimmed = String(name).trim();
  if (!trimmed) {
    throw new ApiError(400, 'El nombre de la categoría es obligatorio.');
  }

  try {
    return await createCategory(pool, trimmed);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      throw new ApiError(400, 'Ya existe una categoría con ese nombre.');
    }
    throw error;
  }
};

export const adminUpdateCategory = async (categoryId, name) => {
  const id = parseId(categoryId, 'El identificador de la categoría');
  const existing = await findCategoryById(pool, id);
  if (!existing) {
    throw new ApiError(404, 'La categoría no existe.');
  }
  const trimmed = String(name).trim();
  if (!trimmed) {
    throw new ApiError(400, 'El nombre de la categoría es obligatorio.');
  }
  await updateCategory(pool, id, trimmed);
  return findCategoryById(pool, id);
};

export const adminDeleteCategory = async (categoryId) => {
  const id = parseId(categoryId, 'El identificador de la categoría');
  const existing = await findCategoryById(pool, id);
  if (!existing) {
    throw new ApiError(404, 'La categoría no existe.');
  }

  const [productsCount] = await pool.execute(
    'SELECT COUNT(*) AS total FROM products WHERE category_id = ?',
    [id]
  );

  if (productsCount[0].total > 0) {
    throw new ApiError(409, `No puedes eliminar la categoría "${existing.name}" porque tiene productos asociados.`);
  }

  await deleteCategory(pool, id);
  return { id };
};

export const adminListUsers = async (search = '') => {
  return listUsers(pool, search);
};

export const adminUpdateUserRole = async (userId, role) => {
  const id = parseId(userId, 'El identificador del usuario');
  const allowed = ['customer', 'admin'];
  if (!allowed.includes(role)) {
    throw new ApiError(400, 'El rol no es válido.');
  }
  await updateUserRole(pool, id, role);
  const user = await findUserById(pool, id);
  return { id, role: user.role };
};

export const adminDeleteUser = async (userId) => {
  const id = parseId(userId, 'El identificador del usuario');
  const existing = await findUserById(pool, id);
  if (!existing) {
    throw new ApiError(404, 'El usuario no existe.');
  }

  if (existing.role === 'admin') {
    const [adminsCount] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'"
    );

    if (adminsCount[0].total <= 1) {
      throw new ApiError(409, 'No puedes eliminar el último administrador del sistema.');
    }
  }

  const [ordersCount] = await pool.execute(
    'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
    [id]
  );

  if (ordersCount[0].total > 0) {
    throw new ApiError(409, '⚠️ No se puede eliminar este usuario porque tiene pedidos asociados.');
  }

  await deleteUser(pool, id);
  return { id };
};

export const adminListOrders = async (searchId) => {
  return listAllOrders(pool, searchId);
};

export const adminGetOrder = async (orderId) => {
  const id = parseId(orderId, 'El identificador de la orden');
  const order = await findOrderByIdAdmin(pool, id);
  if (!order) {
    throw new ApiError(404, 'La orden no existe.');
  }
  const items = await findOrderItems(pool, id);
  return { ...order, items };
};

const ALLOWED_ORDER_STATUSES = ['pending', 'verified', 'processing', 'completed', 'cancelled'];

export const adminUpdateOrderStatus = async (orderId, status) => {
  const id = parseId(orderId, 'El identificador de la orden');
  const normalizedStatus = String(status || '').trim().toLowerCase();

  if (!normalizedStatus || !ALLOWED_ORDER_STATUSES.includes(normalizedStatus)) {
    throw new ApiError(400, 'El estado de la orden no es válido.');
  }

  const existing = await findOrderByIdAdmin(pool, id);
  if (!existing) {
    throw new ApiError(404, 'La orden no existe.');
  }

  const [result] = await pool.execute(
    'UPDATE orders SET status = ? WHERE id = ?',
    [normalizedStatus, id]
  );

  if (!result.affectedRows) {
    throw new ApiError(404, 'La orden no existe.');
  }

  const updated = await findOrderByIdAdmin(pool, id);
  return { id, status: updated.status };
};

export const adminDeleteOrder = async (orderId) => {
  const id = parseId(orderId, 'El identificador de la orden');
  const existing = await findOrderByIdAdmin(pool, id);
  if (!existing) {
    throw new ApiError(404, 'La orden no existe.');
  }

  await deleteOrder(pool, id);
  return { id };
};
