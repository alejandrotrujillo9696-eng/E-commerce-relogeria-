export const createOrder = async (executor, userId, orderData) => {
  const [result] = await executor.execute(
    `INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      orderData.total,
      orderData.shippingName,
      orderData.shippingAddress,
      orderData.shippingCity,
      orderData.shippingZip,
      orderData.shippingPhone,
    ]
  );

  return { id: result.insertId, ...orderData, user_id: userId };
};

export const createOrderItem = async (executor, orderId, productId, quantity, price) => {
  const [result] = await executor.execute(
    `INSERT INTO order_items (order_id, product_id, quantity, price)
     VALUES (?, ?, ?, ?)`,
    [orderId, productId, quantity, price]
  );

  return { id: result.insertId };
};

export const findOrderById = async (executor, orderId, userId) => {
  const [rows] = await executor.execute(
    `SELECT id, user_id, status, total, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone, created_at
     FROM orders
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [orderId, userId]
  );

  return rows[0] || null;
};

export const findOrderByIdAdmin = async (executor, orderId) => {
  const [rows] = await executor.execute(
    `SELECT o.id, o.user_id, o.status, o.total, o.shipping_name, o.shipping_address, o.shipping_city, o.shipping_zip, o.shipping_phone, o.created_at,
            u.first_name, u.last_name, u.email
     FROM orders o
     INNER JOIN users u ON u.id = o.user_id
     WHERE o.id = ?
     LIMIT 1`,
    [orderId]
  );

  return rows[0] || null;
};

export const listAllOrders = async (executor, searchId) => {
  if (searchId !== undefined && searchId !== null && String(searchId).trim() !== '') {
    const id = Number(searchId);
    if (!Number.isInteger(id) || id < 1) {
      return [];
    }

    const [rows] = await executor.execute(
      `SELECT id, user_id, status, total, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone, created_at
       FROM orders
       WHERE id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    return rows;
  }

  const [rows] = await executor.execute(
    `SELECT id, user_id, status, total, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone, created_at
     FROM orders
     ORDER BY created_at DESC`
  );

  return rows;
};

export const findOrderItems = async (executor, orderId) => {
  const [rows] = await executor.execute(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.description, p.image_url AS image
     FROM order_items oi
     INNER JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.created_at ASC`,
    [orderId]
  );

  return rows.map((item) => ({ ...item, price: Number(item.price) }));
};

export const listUserOrders = async (executor, userId) => {
  const [rows] = await executor.execute(
    `SELECT id, status, total, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};

export const deleteOrder = async (executor, orderId) => {
  const [result] = await executor.execute(
    'DELETE FROM orders WHERE id = ?',
    [orderId]
  );

  return result.affectedRows > 0;
};

export const deleteCartItems = async (executor, cartId) => {
  const [result] = await executor.execute(
    'DELETE FROM cart_items WHERE cart_id = ?',
    [cartId]
  );

  return result.affectedRows > 0;
};
