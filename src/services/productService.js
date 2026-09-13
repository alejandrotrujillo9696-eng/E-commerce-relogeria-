import apiClient from './apiClient';

export const getProductsRequest = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return apiClient(`/products${query ? `?${query}` : ''}`);
};

export const getCategoriesRequest = () => apiClient('/products/categories');

export const getProductRequest = (productId) =>
  apiClient(`/products/${productId}`);
