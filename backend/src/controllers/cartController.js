import {
  addItemToCart,
  getUserCart,
  mergeGuestCart,
  removeItemFromCart,
  setCartItemQuantity,
} from '../services/cartService.js';

export const getCart = async (req, res, next) => {
  try {
    const items = await getUserCart(req.auth.userId);
    res.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const items = await addItemToCart(req.auth.userId, req.body);
    res.status(201).json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const items = await setCartItemQuantity(req.auth.userId, req.params.productId, req.body);
    res.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const items = await removeItemFromCart(req.auth.userId, req.params.productId);
    res.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const mergeCart = async (req, res, next) => {
  try {
    const items = await mergeGuestCart(req.auth.userId, req.body);
    res.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};
