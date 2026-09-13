import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../helpers';
import { screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Admin from '../../pages/Admin/Admin';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';

const mockCustomer = {
  id: 1,
  email: 'customer@example.com',
  firstName: 'Customer',
  lastName: 'User',
  role: 'customer',
};
const mockAdmin = {
  id: 2,
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
};

describe('Admin integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('customer no puede acceder a /admin', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockCustomer,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    expect(screen.queryByText('Panel Administrativo')).toBeNull();
  });

  it('admin puede acceder a /admin', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockAdmin,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    expect(screen.getByText('Panel Administrativo')).toBeDefined();
  });
});
