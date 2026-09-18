import apiClient from './apiClient';

export const createOrderRequest = (shippingData) => {
  console.log('[ORDER DEBUG] createOrderRequest llamado');
  console.log('[ORDER DEBUG] shippingData keys:', Object.keys(shippingData || {}));
  return apiClient('/orders', {
    method: 'POST',
    body: JSON.stringify(shippingData),
  });
};

export const getOrderRequest = (orderId) => apiClient(`/orders/${orderId}`);
export const getUserOrdersRequest = () => apiClient('/orders');
export const cancelOrderRequest = (orderId) =>
  apiClient(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
  });

export const deleteOrderRequest = (orderId) =>
  apiClient(`/admin/orders/${orderId}`, {
    method: 'DELETE',
  });
