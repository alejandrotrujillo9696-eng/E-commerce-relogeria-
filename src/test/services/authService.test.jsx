import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch } from '../helpers';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginRequest llama a /auth/login con credenciales', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/auth/login',
        data: { data: { user: {}, token: 't' } },
      },
    ]);
    const { loginRequest } = await import('../../services/authService');
    const result = await loginRequest({ email: 'a@b.com', password: '123' });
    expect(result).toEqual({ user: {}, token: 't' });
  });

  it('registerRequest llama a /auth/register', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/auth/register',
        data: { data: { user: {} } },
      },
    ]);
    const { registerRequest } = await import('../../services/authService');
    const result = await registerRequest({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      password: '123456',
    });
    expect(result).toEqual({ user: {} });
  });

  it('logoutRequest llama a /auth/logout', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/auth/logout',
        data: { data: { message: 'ok' } },
      },
    ]);
    const { logoutRequest } = await import('../../services/authService');
    const result = await logoutRequest();
    expect(result).toEqual({ message: 'ok' });
  });

  it('getCurrentUserRequest llama a /auth/me', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/auth/me',
        data: { data: { user: {} } },
      },
    ]);
    const { getCurrentUserRequest } =
      await import('../../services/authService');
    const result = await getCurrentUserRequest();
    expect(result).toEqual({ user: {} });
  });
});
