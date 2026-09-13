const cartItemsQuery = `SELECT p.id, p.name, p.description, p.price, p.image_url AS image,
  c.name AS category, ci.quantity
  FROM cart_items ci
  INNER JOIN products p ON p.id = ci.product_id
  INNER JOIN categories c ON c.id = p.category_id
  WHERE ci.cart_id = ?
  ORDER BY ci.created_at ASC`;

export const findCartByUserId = async (executor, userId) => {
  const [rows] = await executor.execute(
    'SELECT id, user_id FROM carts WHERE user_id = ? LIMIT 1',
    [userId]
  );

  return rows[0] || null;
};

export const createCart = async (executor, userId) => {
  const [result] = await executor.execute('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return { id: result.insertId, user_id: userId };
};

export const findOrCreateCart = async (executor, userId) => {
  const cart = await findCartByUserId(executor, userId);
  if (cart) {
    return cart;
  }

  try {
    return await createCart(executor, userId);
  } catch (error) {
    // La restricción UNIQUE protege el caso de dos solicitudes simultáneas.
    if (error.code === 'ER_DUP_ENTRY') {
      return findCartByUserId(executor, userId);
    }
    throw error;
  }
};

export const findCartItems = async (executor, cartId) => {
  const [rows] = await executor.execute(cartItemsQuery, [cartId]);
  return rows.map((item) => ({ ...item, price: Number(item.price) }));
};

export const addCartItem = async (executor, cartId, productId, quantity) => {
  await executor.execute(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       quantity = quantity + VALUES(quantity),
       updated_at = CURRENT_TIMESTAMP`,
    [cartId, productId, quantity]
  );
};

export const updateCartItemQuantity = async (executor, cartId, productId, quantity) => {
  const [result] = await executor.execute(
    `UPDATE cart_items
     SET quantity = ?, updated_at = CURRENT_TIMESTAMP
     WHERE cart_id = ? AND product_id = ?`,
    [quantity, cartId, productId]
  );

  return result.affectedRows > 0;
};

export const deleteCartItem = async (executor, cartId, productId) => {
  const [result] = await executor.execute(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );

  return result.affectedRows > 0;
};
