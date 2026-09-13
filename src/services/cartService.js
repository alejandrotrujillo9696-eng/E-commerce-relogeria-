import apiClient from './apiClient';

export const getCartRequest = () => apiClient('/cart');

export const addCartItemRequest = ({ productId, quantity }) =>
  apiClient('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });

export const updateCartItemRequest = ({ productId, quantity }) =>
  apiClient(`/cart/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });

export const removeCartItemRequest = (productId) =>
  apiClient(`/cart/items/${productId}`, {
    method: 'DELETE',
  });

export const mergeGuestCartRequest = (items) =>
  apiClient('/cart/merge', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    }),
  });
