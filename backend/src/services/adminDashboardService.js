import pool from '../config/db.js';

const PERIOD_LABELS = {
  '7d': ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  '30d': [],
  '12m': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const formatMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const getDashboardStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [salesRows] = await connection.execute(
      `SELECT SUM(total) AS total_sales, COUNT(*) AS total_orders
       FROM orders`
    );

    const [customersRows] = await connection.execute(
      `SELECT COUNT(*) AS total_customers
       FROM users
       WHERE role = 'customer'`
    );

    const sales = Number(salesRows[0]?.total_sales || 0);
    const orders = Number(salesRows[0]?.total_orders || 0);
    const customers = Number(customersRows[0]?.total_customers || 0);

    return {
      totalSales: Number.isFinite(sales) ? sales : 0,
      totalOrders: Number.isInteger(orders) ? orders : 0,
      totalCustomers: Number.isInteger(customers) ? customers : 0,
    };
  } finally {
    connection.release();
  }
};

export const getDashboardSales = async (period = '30d') => {
  const connection = await pool.getConnection();
  try {
    const now = new Date();
    let startDate;
    let groupFormat;

    if (period === '7d') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupFormat = 'day';
    } else if (period === '12m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      groupFormat = 'month';
    } else {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      groupFormat = 'day';
    }

    const [rows] = await connection.execute(
      `SELECT DATE(created_at) AS order_date, SUM(total) AS daily_sales
       FROM orders
       WHERE created_at >= ?
       GROUP BY order_date
       ORDER BY order_date ASC`,
      [formatDate(startDate)]
    );

    const salesMap = new Map();
    for (const row of rows) {
      const orderDate = row.order_date instanceof Date ? formatDate(row.order_date) : String(row.order_date);
      const key = groupFormat === 'month' ? orderDate.slice(0, 7) : orderDate;
      const current = salesMap.get(key) || 0;
      salesMap.set(key, current + Number(row.daily_sales || 0));
    }

    if (groupFormat === 'month') {
      const labels = [];
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = formatMonthKey(date);
        labels.push(PERIOD_LABELS['12m'][date.getMonth()]);
        data.push(Number(salesMap.get(key) || 0));
      }
      return { labels, data };
    }

    if (period === '7d') {
      const labels = [];
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = formatDate(date);
        labels.push(PERIOD_LABELS['7d'][date.getDay()]);
        data.push(Number(salesMap.get(key) || 0));
      }
      return { labels, data };
    }

    const labels = [];
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = formatDate(date);
      labels.push(`${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`);
      data.push(Number(salesMap.get(key) || 0));
    }
    return { labels, data };
  } finally {
    connection.release();
  }
};

export const getDashboardOrdersByStatus = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT status, COUNT(*) AS total
       FROM orders
       GROUP BY status`
    );

    const counts = {
      pending: 0,
      verified: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const row of rows) {
      const status = String(row.status || '').toLowerCase();
      if (status in counts) {
        counts[status] = Number(row.total || 0);
      }
    }

    return counts;
  } finally {
    connection.release();
  }
};

export const getDashboardProductsSummary = async () => {
  const connection = await pool.getConnection();
  try {
    const [activeRows] = await connection.execute(
      `SELECT COUNT(*) AS total FROM products WHERE stock > 0`
    );
    const [lowStockRows] = await connection.execute(
      `SELECT COUNT(*) AS total FROM products WHERE stock > 0 AND stock <= 5`
    );
    const [outOfStockRows] = await connection.execute(
      `SELECT COUNT(*) AS total FROM products WHERE stock = 0`
    );
    const [categoriesRows] = await connection.execute(
      `SELECT COUNT(*) AS total FROM categories`
    );

    return {
      activeProducts: Number(activeRows[0]?.total || 0),
      lowStockProducts: Number(lowStockRows[0]?.total || 0),
      outOfStockProducts: Number(outOfStockRows[0]?.total || 0),
      totalCategories: Number(categoriesRows[0]?.total || 0),
    };
  } finally {
    connection.release();
  }
};

export const getDashboardAverageTicket = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT AVG(total) AS average_ticket FROM orders`
    );

    const value = Number(rows[0]?.average_ticket || 0);
    return Number.isFinite(value) ? value : 0;
  } finally {
    connection.release();
  }
};

export const getDashboardRecentOrders = async (limit = 5) => {
  const safeLimit = Math.max(1, Math.min(limit, 20));
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT o.id, o.status, o.total, o.created_at,
              u.first_name, u.last_name, u.email
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT ${safeLimit}`
    );

    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      total: Number(row.total || 0),
      createdAt: row.created_at,
      customer: `${row.first_name} ${row.last_name}`,
      email: row.email,
    }));
  } finally {
    connection.release();
  }
};

export const getDashboardRecentUsers = async (limit = 5) => {
  const safeLimit = Math.max(1, Math.min(limit, 20));
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT id, first_name, last_name, email, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ${safeLimit}`
    );

    return rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    }));
  } finally {
    connection.release();
  }
};

export const getDashboardTopProducts = async (limit = 5) => {
  const safeLimit = Math.max(1, Math.min(limit, 20));
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT p.id, p.name, p.image_url AS image, c.name AS category,
              SUM(oi.quantity) AS total_quantity, SUM(oi.quantity * oi.price) AS total_sales
       FROM order_items oi
       INNER JOIN products p ON p.id = oi.product_id
       INNER JOIN categories c ON c.id = p.category_id
       GROUP BY p.id
       ORDER BY total_sales DESC
       LIMIT ${safeLimit}`
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      image: row.image,
      category: row.category,
      totalQuantity: Number(row.total_quantity || 0),
      totalSales: Number(row.total_sales || 0),
    }));
  } finally {
    connection.release();
  }
};

export const getDashboardSalesByCategory = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT c.id, c.name, SUM(oi.quantity * oi.price) AS total_sales
       FROM order_items oi
       INNER JOIN products p ON p.id = oi.product_id
       INNER JOIN categories c ON c.id = p.category_id
       GROUP BY c.id, c.name
       ORDER BY total_sales DESC`
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      totalSales: Number(row.total_sales || 0),
    }));
  } finally {
    connection.release();
  }
};
