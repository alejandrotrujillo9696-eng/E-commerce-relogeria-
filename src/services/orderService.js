import apiClient, { diagnosticLog } from './apiClient';

export const createOrderRequest = (shippingData) => {
  diagnosticLog.push({ step: 'createOrderRequest', status: 'llamado', error: null });
  diagnosticLog.push({ step: 'shippingData keys', status: Object.keys(shippingData || {}).join(', '), error: null });
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
