import {
  addHomeSectionItemService,
  getHomeSection as getHomeSectionService,
  getMonthlyFeaturedProduct as getMonthlyFeaturedProductService,
  removeHomeSectionItemService,
  replaceHomeSectionItemsService,
  updateHomeSectionItemOrderService,
  updateHomeSectionTitleService,
} from '../services/homeSectionService.js';

export const getMonthlyFeaturedProduct = async (_req, res, next) => {
  try {
    const product = await getMonthlyFeaturedProductService();
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

export const getHomeSection = async (_req, res, next) => {
  try {
    const section = await getHomeSectionService();
    res.json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

export const updateHomeSectionTitle = async (req, res, next) => {
  try {
    const section = await updateHomeSectionTitleService(req.body.title);
    res.json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

export const addHomeSectionItem = async (req, res, next) => {
  try {
    const item = await addHomeSectionItemService(req.body.productId, req.body.sortOrder);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const removeHomeSectionItem = async (req, res, next) => {
  try {
    const result = await removeHomeSectionItemService(req.params.itemId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateHomeSectionItemOrder = async (req, res, next) => {
  try {
    const result = await updateHomeSectionItemOrderService(req.params.itemId, req.body.sortOrder);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const replaceHomeSectionItems = async (req, res, next) => {
  try {
    const section = await replaceHomeSectionItemsService(req.body.items);
    res.json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};
