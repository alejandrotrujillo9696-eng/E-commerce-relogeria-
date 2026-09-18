import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, {
  login,
  logout,
  loadCurrentUser,
  clearAuthError,
} from '../../../features/auth/authSlice';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
};

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadCurrentUser fulfilled actualiza usuario y initialized', () => {
    const state = authReducer(undefined, {
      type: loadCurrentUser.fulfilled.type,
      payload: { user: mockUser },
    });
    expect(state.user).toEqual(mockUser);
    expect(state.initialized).toBe(true);
    expect(state.status).toBe('idle');
  });

  it('loadCurrentUser rejected mantiene usuario null y marca initialized', () => {
    const state = authReducer(undefined, {
      type: loadCurrentUser.rejected.type,
    });
    expect(state.user).toBeNull();
    expect(state.initialized).toBe(true);
    expect(state.status).toBe('idle');
  });

  it('ignora una respuesta tardía de loadCurrentUser después del login', () => {
    const pending = authReducer(undefined, {
      type: loadCurrentUser.pending.type,
      meta: { requestId: 'initial-load' },
    });
    const loggedIn = authReducer(pending, {
      type: login.fulfilled.type,
      payload: { user: mockUser, token: 'fresh-token' },
    });
    const state = authReducer(loggedIn, {
      type: loadCurrentUser.rejected.type,
      meta: { requestId: 'initial-load' },
    });

    expect(state.user).toEqual(mockUser);
    expect(state.initialized).toBe(true);
  });

  it('login fulfilled setea usuario y limpia error', () => {
    const state = authReducer(
      { user: null, initialized: false, status: 'idle', error: 'error' },
      {
        type: login.fulfilled.type,
        payload: { user: mockUser },
      }
    );
    expect(state.user).toEqual(mockUser);
    expect(state.initialized).toBe(true);
    expect(state.error).toBeNull();
  });

  it('login rejected setea error', () => {
    const state = authReducer(
      { user: null, initialized: false, status: 'idle', error: null },
      {
        type: login.rejected.type,
        payload: 'Credenciales inválidas',
      }
    );
    expect(state.error).toBe('Credenciales inválidas');
    expect(state.status).toBe('idle');
  });

  it('logout fulfilled limpia usuario', () => {
    const state = authReducer(
      { user: mockUser, initialized: true, status: 'idle', error: null },
      {
        type: logout.fulfilled.type,
      }
    );
    expect(state.user).toBeNull();
    expect(state.status).toBe('idle');
  });

  it('logout pending limpia sesión e invalida loadCurrentUser pendiente', () => {
    const state = authReducer(
      {
        user: mockUser,
        token: 'token',
        initialized: true,
        status: 'idle',
        error: null,
        initializationRequestId: 'initial-load',
      },
      { type: logout.pending.type }
    );

    const staleResponse = authReducer(state, {
      type: loadCurrentUser.fulfilled.type,
      payload: { user: mockUser },
      meta: { requestId: 'initial-load' },
    });

    expect(staleResponse.user).toBeNull();
    expect(staleResponse.initializationRequestId).toBe('superseded-by-logout');
  });

  it('clearAuthError limpia el error', () => {
    const state = authReducer(
      { user: null, initialized: true, status: 'idle', error: 'some error' },
      clearAuthError()
    );
    expect(state.error).toBeNull();
  });
});
