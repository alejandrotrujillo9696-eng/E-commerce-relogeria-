import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';

export const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { auth: authReducer, cart: cartReducer },
    preloadedState,
  });
};

export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    initialEntries = ['/'],
    withRouter = true,
    ...renderOptions
  } = {}
) => {
  const store = createMockStore(preloadedState);

  const Wrapper = ({ children }) => {
    if (withRouter) {
      return (
        <Provider store={store}>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        </Provider>
      );
    }
    return <Provider store={store}>{children}</Provider>;
  };

  Wrapper.propTypes = {
    children: PropTypes.node,
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

export const mockFetch = (handlers = []) => {
  global.fetch = vi.fn(async (input) => {
    const url = typeof input === 'string' ? input : input.url;

    if (url === 'http://localhost:3001/api/csrf-token') {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { token: 'test-csrf-token' } }),
      };
    }

    const handler = handlers.find((h) => {
      if (h.url instanceof RegExp) return h.url.test(url);
      if (typeof h.url === 'function') return h.url(url);
      return url === h.url;
    });
    if (!handler) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'No mock handler for ' + url }),
      };
    }
    return {
      ok: handler.ok ?? true,
      status: handler.status ?? 200,
      json: async () => handler.data ?? {},
    };
  });
};

export const mockLocationAssign = () => {
  const assign = vi.fn();
  const original = global.window.location;
  Object.defineProperty(global.window, 'location', {
    value: { ...original, assign },
    writable: true,
    configurable: true,
  });
  return assign;
};
