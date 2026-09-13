import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { getProduct, listCategories, listProducts } from '../services/productService.js';

const COOKIE_NAME = 'auth_token';

const getRequestUser = (req) => {
  const authorization = req.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  const token = req.cookies[COOKIE_NAME] || bearerToken;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { userId: payload.sub, role: payload.role || 'customer' };
  } catch {
    return null;
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const user = getRequestUser(req);
    const includeStock = user?.role === 'admin';
    const data = await listProducts(pool, { ...req.query, includeStock: String(includeStock) });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const user = getRequestUser(req);
    const includeStock = user?.role === 'admin';
    const product = await getProduct(pool, req.params.productId, includeStock);
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req, res, next) => {
  try {
    const categories = await listCategories(pool);
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};
