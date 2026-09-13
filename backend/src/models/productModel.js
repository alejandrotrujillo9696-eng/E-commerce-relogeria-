const formatProduct = (product, includeStock = true) => {
  const formatted = {
    ...product,
    price: Number(product.price),
  };

  if (includeStock) {
    formatted.stock = Number(product.stock ?? 0);
  }

  return formatted;
};

export const findProducts = async (executor, filters) => {
  const conditions = [];
  const values = [];

  if (filters.query) {
    conditions.push('p.name LIKE ?');
    values.push(`%${filters.query}%`);
  }

  if (filters.minPrice !== null) {
    conditions.push('p.price >= ?');
    values.push(filters.minPrice);
  }

  if (filters.maxPrice !== null) {
    conditions.push('p.price <= ?');
    values.push(filters.maxPrice);
  }

  if (filters.category) {
    conditions.push('c.name = ?');
    values.push(filters.category);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [countRows] = await executor.execute(
    `SELECT COUNT(*) AS total
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     ${whereClause}`,
    values
  );
  const [rows] = await executor.execute(
    `SELECT p.id, p.name, p.description, p.price, p.image_url AS image, c.name AS category, c.id AS category_id, p.stock
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY p.id ASC
     LIMIT ${filters.limit} OFFSET ${filters.offset}`,
    values
  );

  return {
    products: rows.map((product) => formatProduct(product, filters.includeStock !== false)),
    total: countRows[0].total,
  };
};

export const findProductById = async (executor, productId, includeStock = true) => {
  const [rows] = await executor.execute(
    `SELECT p.id, p.name, p.description, p.price, p.image_url AS image, c.name AS category, c.id AS category_id, p.stock
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?
     LIMIT 1`,
    [productId]
  );

  return rows[0] ? formatProduct(rows[0], includeStock) : null;
};

export const findCategories = async (executor) => {
  const [rows] = await executor.execute(
    `SELECT c.id, c.name
     FROM categories c
     ORDER BY c.name ASC`
  );

  return rows;
};

export const createProduct = async (executor, product) => {
  const [result] = await executor.execute(
    `INSERT INTO products (name, description, price, image_url, category_id, stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [product.name, product.description, product.price, product.imageUrl, product.categoryId, product.stock ?? 0]
  );

  return { id: result.insertId };
};

export const updateProduct = async (executor, productId, product) => {
  const [result] = await executor.execute(
    `UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, stock = ?
     WHERE id = ?`,
    [product.name, product.description, product.price, product.imageUrl, product.categoryId, product.stock ?? 0, productId]
  );

  return result.affectedRows > 0;
};

export const deleteProduct = async (executor, productId) => {
  const [result] = await executor.execute(
    'DELETE FROM products WHERE id = ?',
    [productId]
  );

  return result.affectedRows > 0;
};
