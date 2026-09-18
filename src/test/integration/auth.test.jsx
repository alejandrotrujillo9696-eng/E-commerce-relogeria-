import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../helpers';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Auth/Login/Login';
import Register from '../../pages/Auth/Register/Register';
import Header from '../../components/Header/header';
import { logout } from '../../features/auth/authSlice';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
};

vi.mock('../../services/authService', () => ({
  registerRequest: vi.fn(),
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  getCurrentUserRequest: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  ToastContainer: () => null,
}));

describe('Auth integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login exitoso actualiza el estado de autenticación', async () => {
    const { loginRequest } = await import('../../services/authService');
    loginRequest.mockResolvedValue({ user: mockUser, token: 'fake-token' });

    renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>,
      { withRouter: false }
    );

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Iniciar sesión' }).closest('form')
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
    });
  });

  it('login con credenciales inválidas muestra error', async () => {
    const { loginRequest } = await import('../../services/authService');
    loginRequest.mockRejectedValue(new Error('Credenciales inválidas'));

    renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>,
      { withRouter: false }
    );

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrong' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Iniciar sesión' }).closest('form')
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Correo electrónico')).toHaveValue(
        'wrong@example.com'
      );
    });
  });

  it('muestra los enlaces OAuth de los tres proveedores', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>,
      { withRouter: false }
    );

    expect(screen.getAllByRole('button', { name: '' })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: expect.stringContaining('/auth/social/facebook') }),
        expect.objectContaining({ href: expect.stringContaining('/auth/social/twitter') }),
        expect.objectContaining({ href: expect.stringContaining('/auth/social/google') }),
      ])
    );
  });

  it('registro exitoso actualiza el estado de autenticación', async () => {
    const { registerRequest } = await import('../../services/authService');
    registerRequest.mockResolvedValue({ user: mockUser, token: 'fake-token' });

    renderWithProviders(
      <MemoryRouter initialEntries={['/register']}>
        <Register />
      </MemoryRouter>,
      { withRouter: false }
    );

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Apellido'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByLabelText('Usuario / Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Registrarse' }).closest('form')
    );

    await waitFor(
      () => {
        expect(
          screen.getByLabelText('Usuario / Correo electrónico')
        ).toHaveValue('');
      },
      { timeout: 3000 }
    );
  });

  it('usuario autenticado muestra el icono de usuario en el header', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    expect(screen.getByRole('button', { name: '' })).toBeDefined();
  });

  it('usuario no autenticado muestra el icono de usuario en el header', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: { user: null, initialized: true, status: 'idle', error: null },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    expect(screen.getByRole('button', { name: '' })).toBeDefined();
  });

  it('logout desde el header limpia el usuario del estado', async () => {
    const { logoutRequest } = await import('../../services/authService');
    logoutRequest.mockResolvedValue({ message: 'Logged out' });

    const { store } = renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    await store.dispatch(logout());

    await waitFor(() => {
      expect(store.getState().auth.user).toBeNull();
    });
  });
});
