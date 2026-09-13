import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ProductCard from '../components/ProductCard/ProductCard';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';

const store = configureStore({
  reducer: { auth: authReducer, cart: cartReducer },
});

const renderWithProviders = (ui) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    const product = {
      id: 1,
      name: 'Test Watch',
      description: 'Desc',
      price: 100,
      image: 'img.png',
      category: 'Diver',
    };
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText('Test Watch')).toBeDefined();
    expect(screen.getByText('100,00 COP')).toBeDefined();
  });

  it('shows add to cart button', () => {
    const product = {
      id: 1,
      name: 'Test Watch',
      description: 'Desc',
      price: 100,
      image: 'img.png',
      category: 'Diver',
      stock: 5,
    };
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText('Añadir al carrito')).toBeDefined();
  });
});
