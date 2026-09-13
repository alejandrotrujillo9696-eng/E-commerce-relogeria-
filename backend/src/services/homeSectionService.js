import { ApiError } from '../middleware/errorHandler.js';
import pool from '../config/db.js';
import {
  addHomeSectionItem,
  clearHomeSectionItems,
  createHomeSection,
  findHomeSection,
  getHomeSectionItemById,
  removeHomeSectionItem,
  updateHomeSectionItemOrder,
  updateHomeSectionTitle,
} from '../models/homeModel.js';

export const getHomeSection = async () => {
  const connection = await pool.getConnection();
  try {
    const section = await findHomeSection(connection);
    if (!section) {
      const created = await createHomeSection(connection, 'Nuestra colección exclusiva de relojes');
      return { ...created, items: [] };
    }

    return section;
  } finally {
    connection.release();
  }
};

export const updateHomeSectionTitleService = async (title) => {
  if (!title || String(title).trim() === '') {
    throw new ApiError(400, 'El título de la sección es obligatorio.');
  }

  const connection = await pool.getConnection();
  try {
    const section = await findHomeSection(connection);
    if (!section) {
      const created = await createHomeSection(connection, title.trim());
      return { ...created, items: [] };
    }

    const updated = await updateHomeSectionTitle(connection, section.id, title.trim());
    if (!updated) {
      throw new ApiError(404, 'No fue posible actualizar el título.');
    }

    return { ...section, title: title.trim() };
  } finally {
    connection.release();
  }
};

export const addHomeSectionItemService = async (productId, sortOrder) => {
  const connection = await pool.getConnection();
  try {
    const section = await findHomeSection(connection);
    if (!section) {
      throw new ApiError(404, 'No se encontró la sección de inicio.');
    }

    const [productRows] = await connection.execute(
      `SELECT id FROM products WHERE id = ? LIMIT 1`,
      [productId]
    );

    if (!productRows[0]) {
      throw new ApiError(404, 'El producto no existe.');
    }

    const [duplicateRows] = await connection.execute(
      `SELECT id FROM home_section_items WHERE home_section_id = ? AND product_id = ? LIMIT 1`,
      [section.id, productId]
    );

    if (duplicateRows[0]) {
      throw new ApiError(409, 'El producto ya está en la colección de inicio.');
    }

    const item = await addHomeSectionItem(connection, section.id, productId, sortOrder ?? 0);
    return item;
  } finally {
    connection.release();
  }
};

export const removeHomeSectionItemService = async (itemId) => {
  const connection = await pool.getConnection();
  try {
    const item = await getHomeSectionItemById(connection, itemId);
    if (!item) {
      throw new ApiError(404, 'El elemento de la sección no existe.');
    }

    const deleted = await removeHomeSectionItem(connection, itemId);
    if (!deleted) {
      throw new ApiError(404, 'No fue posible eliminar el elemento.');
    }

    return { id: itemId };
  } finally {
    connection.release();
  }
};

export const updateHomeSectionItemOrderService = async (itemId, sortOrder) => {
  const connection = await pool.getConnection();
  try {
    const item = await getHomeSectionItemById(connection, itemId);
    if (!item) {
      throw new ApiError(404, 'El elemento de la sección no existe.');
    }

    const updated = await updateHomeSectionItemOrder(connection, itemId, sortOrder);
    if (!updated) {
      throw new ApiError(404, 'No fue posible actualizar el orden.');
    }

    return { id: itemId, sortOrder };
  } finally {
    connection.release();
  }
};

export const replaceHomeSectionItemsService = async (items) => {
  if (!Array.isArray(items) || items.length > 100) {
    throw new ApiError(400, 'Los items de la sección no tienen un formato válido.');
  }

  const connection = await pool.getConnection();
  try {
    const section = await findHomeSection(connection);
    if (!section) {
      throw new ApiError(404, 'No se encontró la sección de inicio.');
    }

    const productIds = items
      .map((item) => Number(item.productId ?? item.id))
      .filter((productId) => Number.isInteger(productId) && productId > 0);

    if (productIds.length !== items.length) {
      throw new ApiError(400, 'Uno o más productos no son válidos.');
    }

    if (productIds.length !== new Set(productIds).size) {
      throw new ApiError(409, 'No puedes agregar el mismo producto más de una vez.');
    }

    const [productRows] = await connection.execute(
      `SELECT id FROM products WHERE id IN (?)`,
      [productIds]
    );

    if (productRows.length !== productIds.length) {
      throw new ApiError(404, 'Uno o más productos no existen.');
    }

    await clearHomeSectionItems(connection, section.id);

    for (let index = 0; index < items.length; index++) {
      const productId = productIds[index];
      await addHomeSectionItem(connection, section.id, productId, index);
    }

    const updatedSection = await findHomeSection(connection);
    return updatedSection;
  } finally {
    connection.release();
  }
};
