import { findCategories as findCategoriesQuery } from './productModel.js';

export const findCategories = findCategoriesQuery;

export const findCategoryById = async (executor, categoryId) => {
  const [rows] = await executor.execute(
    `SELECT id, name FROM categories WHERE id = ? LIMIT 1`,
    [categoryId]
  );

  return rows[0] || null;
};

export const createCategory = async (executor, name) => {
  const [result] = await executor.execute(
    `INSERT INTO categories (name) VALUES (?)`,
    [name]
  );

  return { id: result.insertId, name };
};

export const updateCategory = async (executor, categoryId, name) => {
  const [result] = await executor.execute(
    `UPDATE categories SET name = ? WHERE id = ?`,
    [name, categoryId]
  );

  return result.affectedRows > 0;
};

export const deleteCategory = async (executor, categoryId) => {
  const [result] = await executor.execute(
    `DELETE FROM categories WHERE id = ?`,
    [categoryId]
  );

  return result.affectedRows > 0;
};
