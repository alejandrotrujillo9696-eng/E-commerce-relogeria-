import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getProductsRequest,
  getCategoriesRequest,
} from '../services/productService';

export function useProductCatalog({ limit = 8 } = {}) {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    setSelectedCategory(categoryParam || '');
    setCurrentPage(1);
  }, [location]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, minPrice, maxPrice, selectedCategory]);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        const data = await getCategoriesRequest();
        if (active) setCategories(data.categories || []);
      } catch {
        // ignore
      }
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProductsRequest({
          q: searchTerm,
          category: selectedCategory,
          minPrice,
          maxPrice,
          page: currentPage,
          limit,
        });
        if (!active) return;
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (requestError) {
        if (!active) return;
        setError(
          typeof requestError === 'string'
            ? requestError
            : 'No fue posible cargar los productos.'
        );
        setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      active = false;
    };
  }, [searchTerm, minPrice, maxPrice, selectedCategory, currentPage, limit]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return {
    products,
    categories,
    searchTerm,
    setSearchTerm,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedCategory,
    setSelectedCategory,
    currentPage,
    totalPages,
    loading,
    error,
    handlePageChange,
  };
}
