import apiClient from './apiClient';

export const getDashboardStatsRequest = () => apiClient('/admin/dashboard');

export const getDashboardSalesRequest = (period = '30d') =>
  apiClient(`/admin/dashboard/sales?period=${encodeURIComponent(period)}`);

export const getDashboardOrdersByStatusRequest = () =>
  apiClient('/admin/dashboard/orders-by-status');

export const getDashboardProductsSummaryRequest = () =>
  apiClient('/admin/dashboard/products-summary');

export const getDashboardRecentOrdersRequest = (limit = 5) =>
  apiClient(`/admin/dashboard/recent-orders?limit=${encodeURIComponent(limit)}`);

export const getDashboardRecentUsersRequest = (limit = 5) =>
  apiClient(`/admin/dashboard/recent-users?limit=${encodeURIComponent(limit)}`);

export const getDashboardTopProductsRequest = (limit = 5) =>
  apiClient(`/admin/dashboard/top-products?limit=${encodeURIComponent(limit)}`);

export const getDashboardSalesByCategoryRequest = () =>
  apiClient('/admin/dashboard/sales-by-category');
