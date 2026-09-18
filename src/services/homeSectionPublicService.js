import apiClient from './apiClient';

export const getHomeSectionRequest = () => apiClient('/home-section');

export const getMonthlyFeaturedProductRequest = () =>
	apiClient('/home-section/featured');
