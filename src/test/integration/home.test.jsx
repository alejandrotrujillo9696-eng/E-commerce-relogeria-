import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../pages/Home/Home';

const { getMonthlyFeaturedProductRequest } = vi.hoisted(() => ({
  getMonthlyFeaturedProductRequest: vi.fn(),
}));

vi.mock('../../services/homeSectionPublicService', () => ({
  getHomeSectionRequest: vi.fn(),
  getMonthlyFeaturedProductRequest,
}));

vi.mock('../../components/HomeProduct/Home-ProductList', () => ({
  default: () => null,
}));

describe('Home monthly featured product', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the monthly section with the product returned by sales', async () => {
    getMonthlyFeaturedProductRequest.mockResolvedValue({
      product: {
        id: 4,
        name: 'Best Seller',
        description: 'Most sold this month',
        price: 1250,
        image: 'best-seller.jpg',
      },
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('DESTACADO DEL MES')).toBeDefined();
      expect(screen.getByText('Best Seller')).toBeDefined();
      expect(screen.getByText('1.250,00 COP')).toBeDefined();
      expect(screen.getByAltText('Best Seller')).toHaveAttribute(
        'src',
        'best-seller.jpg'
      );
    });
  });

  it('keeps the section visible with a controlled empty state', async () => {
    getMonthlyFeaturedProductRequest.mockResolvedValue({ product: null });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('DESTACADO DEL MES')).toBeDefined();
      expect(
        screen.getByText('Aún no hay ventas válidas registradas este mes.')
      ).toBeDefined();
    });
  });
});
