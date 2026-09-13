import {
  getDashboardAverageTicket,
  getDashboardOrdersByStatus,
  getDashboardProductsSummary,
  getDashboardRecentOrders,
  getDashboardRecentUsers,
  getDashboardSales,
  getDashboardSalesByCategory,
  getDashboardStats,
  getDashboardTopProducts,
} from '../services/adminDashboardService.js';

export const getDashboard = async (req, res, next) => {
  try {
    const [stats, ordersByStatus, productsSummary, averageTicket] = await Promise.all([
      getDashboardStats(),
      getDashboardOrdersByStatus(),
      getDashboardProductsSummary(),
      getDashboardAverageTicket(),
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        ordersByStatus,
        productsSummary,
        averageTicket,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSalesHandler = async (req, res, next) => {
  try {
    const period = ['7d', '30d', '12m'].includes(req.query.period) ? req.query.period : '30d';
    const series = await getDashboardSales(period);
    res.json({ success: true, data: series });
  } catch (error) {
    next(error);
  }
};

export const getDashboardOrdersByStatusHandler = async (req, res, next) => {
  try {
    const data = await getDashboardOrdersByStatus();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDashboardProductsSummaryHandler = async (req, res, next) => {
  try {
    const data = await getDashboardProductsSummary();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDashboardRecentOrdersHandler = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const data = await getDashboardRecentOrders(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDashboardRecentUsersHandler = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const data = await getDashboardRecentUsers(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDashboardTopProductsHandler = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const data = await getDashboardTopProducts(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSalesByCategoryHandler = async (req, res, next) => {
  try {
    const data = await getDashboardSalesByCategory();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
