import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useProductCatalog } from '../hooks/useProductFilters';

const wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('useProductFilters', () => {
  it('returns expected keys from useProductCatalog', () => {
    const { result } = renderHook(() => useProductCatalog({ limit: 32 }), {
      wrapper,
    });
    expect(result.current.products).toBeDefined();
    expect(typeof result.current.setSearchTerm).toBe('function');
    expect(typeof result.current.setSelectedCategory).toBe('function');
    expect(typeof result.current.handlePageChange).toBe('function');
  });
});
