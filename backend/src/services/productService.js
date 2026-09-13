import { ApiError } from '../middleware/errorHandler.js';
import { findCategories, findProductById, findProducts } from '../models/productModel.js';

const toPositiveInteger = (value, fallback, max) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new ApiError(400, `El parámetro debe ser un entero entre 1 y ${max}.`);
  }

  return parsed;
};

const toPrice = (value, name) => {
  if (value === undefined || value === '') return null;
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ApiError(400, `${name} debe ser un número mayor o igual a cero.`);
  }

  return parsed;
};

export const listProducts = async (executor, query) => {
  const page = toPositiveInteger(query.page, 1, 100000);
  const limit = toPositiveInteger(query.limit, 8, 100);
  const minPrice = toPrice(query.minPrice, 'minPrice');
  const maxPrice = toPrice(query.maxPrice, 'maxPrice');

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw new ApiError(400, 'minPrice no puede ser mayor que maxPrice.');
  }

  const filters = {
    query: query.q?.trim().slice(0, 100) || '',
    category: query.category?.trim().slice(0, 100) || '',
    minPrice,
    maxPrice,
    limit,
    offset: (page - 1) * limit,
    includeStock: query.includeStock === 'true',
  };
  const { products, total } = await findProducts(executor, filters);

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getProduct = async (executor, productId, includeStock = true) => {
  const id = Number(productId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'El identificador del producto no es válido.');
  }

  const product = await findProductById(executor, id, includeStock);
  if (!product) {
    throw new ApiError(404, 'El producto no existe.');
  }

  return product;
};

export const listCategories = (executor) => findCategories(executor);
