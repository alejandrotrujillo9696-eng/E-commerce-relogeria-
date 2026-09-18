export const findHomeSection = async (executor) => {
  const [sectionRows] = await executor.execute(
    `SELECT id, title FROM home_sections LIMIT 1`
  );

  const section = sectionRows[0] || null;
  if (!section) {
    return null;
  }

  const [itemRows] = await executor.execute(
    `SELECT hsi.id, hsi.product_id, hsi.sort_order, p.name, p.description, p.price, p.image_url AS image, c.name AS category, c.id AS category_id
     FROM home_section_items hsi
     INNER JOIN products p ON p.id = hsi.product_id
     INNER JOIN categories c ON c.id = p.category_id
     WHERE hsi.home_section_id = ?
     ORDER BY hsi.sort_order ASC`,
    [section.id]
  );

  return {
    ...section,
    items: itemRows.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  };
};

export const findMonthlyFeaturedProduct = async (executor, monthStart, monthEnd) => {
  const [rows] = await executor.execute(
    `SELECT p.id, p.name, p.description, p.price, p.image_url AS image,
            c.name AS category, c.id AS category_id,
            SUM(oi.quantity) AS sold_quantity,
            MAX(o.created_at) AS latest_sale_at
     FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN products p ON p.id = oi.product_id
     INNER JOIN categories c ON c.id = p.category_id
     WHERE o.status IN ('verified', 'processing', 'completed')
       AND o.created_at >= ?
       AND o.created_at < ?
     GROUP BY p.id, p.name, p.description, p.price, p.image_url, c.name, c.id
     ORDER BY sold_quantity DESC, latest_sale_at DESC, p.id ASC
     LIMIT 1`,
    [monthStart, monthEnd]
  );

  if (!rows[0]) {
    return null;
  }

  return {
    ...rows[0],
    price: Number(rows[0].price),
    sold_quantity: Number(rows[0].sold_quantity),
  };
};

export const updateHomeSectionTitle = async (executor, sectionId, title) => {
  const [result] = await executor.execute(
    `UPDATE home_sections SET title = ? WHERE id = ?`,
    [title, sectionId]
  );

  return result.affectedRows > 0;
};

export const createHomeSection = async (executor, title) => {
  const [result] = await executor.execute(
    `INSERT INTO home_sections (title) VALUES (?)`,
    [title]
  );

  return { id: result.insertId, title };
};

export const addHomeSectionItem = async (executor, homeSectionId, productId, sortOrder) => {
  const [result] = await executor.execute(
    `INSERT INTO home_section_items (home_section_id, product_id, sort_order) VALUES (?, ?, ?)`,
    [homeSectionId, productId, sortOrder]
  );

  return { id: result.insertId };
};

export const removeHomeSectionItem = async (executor, itemId) => {
  const [result] = await executor.execute(
    `DELETE FROM home_section_items WHERE id = ?`,
    [itemId]
  );

  return result.affectedRows > 0;
};

export const updateHomeSectionItemOrder = async (executor, itemId, sortOrder) => {
  const [result] = await executor.execute(
    `UPDATE home_section_items SET sort_order = ? WHERE id = ?`,
    [sortOrder, itemId]
  );

  return result.affectedRows > 0;
};

export const clearHomeSectionItems = async (executor, homeSectionId) => {
  const [result] = await executor.execute(
    `DELETE FROM home_section_items WHERE home_section_id = ?`,
    [homeSectionId]
  );

  return result.affectedRows > 0;
};

export const getHomeSectionItemById = async (executor, itemId) => {
  const [rows] = await executor.execute(
    `SELECT id, home_section_id, product_id, sort_order FROM home_section_items WHERE id = ? LIMIT 1`,
    [itemId]
  );

  return rows[0] || null;
};
