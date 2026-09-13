import {
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteOrder,
  adminDeleteProduct,
  adminDeleteUser,
  adminGetOrder,
  adminListOrders,
  adminListUsers,
  adminUpdateCategory,
  adminUpdateOrderStatus,
  adminUpdateProduct,
  adminUpdateUserRole,
} from '../services/adminService.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await adminCreateProduct(req.body);
    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await adminUpdateProduct(req.params.productId, req.body);
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await adminDeleteProduct(req.params.productId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await adminCreateCategory(req.body.name);
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await adminUpdateCategory(req.params.categoryId, req.body.name);
    res.json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const result = await adminDeleteCategory(req.params.categoryId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await adminListUsers(req.query.search);
    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const data = await adminUpdateUserRole(req.params.userId, req.body.role);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await adminDeleteUser(req.params.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const orders = await adminListOrders(req.query.search);
    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await adminGetOrder(req.params.orderId);
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await adminUpdateOrderStatus(req.params.orderId, req.body.status);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const result = await adminDeleteOrder(req.params.orderId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
