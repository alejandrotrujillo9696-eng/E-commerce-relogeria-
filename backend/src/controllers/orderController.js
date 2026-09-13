import {
  cancelUserOrder,
  createUserOrder,
  deleteUserOrder,
  getUserOrder,
  getUserOrders,
} from '../services/orderService.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await createUserOrder(req.auth.userId, req.body);
    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await getUserOrder(req.auth.userId, req.params.orderId);
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const orders = await getUserOrders(req.auth.userId);
    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const result = await cancelUserOrder(req.auth.userId, req.params.orderId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const result = await deleteUserOrder(req.auth.userId, req.params.orderId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
