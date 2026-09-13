import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch } from '../helpers';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna body.data en éxito', async () => {
    mockFetch([
      { url: 'http://localhost:3001/api/test', data: { data: { id: 1 } } },
    ]);
    const { default: apiClient } = await import('../../services/apiClient');
    const result = await apiClient('/test');
    expect(result).toEqual({ id: 1 });
  });

  it('lanza error con mensaje del servidor', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/test',
        ok: false,
        status: 400,
        data: { message: 'Bad request' },
      },
    ]);
    const { default: apiClient } = await import('../../services/apiClient');
    await expect(apiClient('/test')).rejects.toThrow('Bad request');
  });

  it('lanza error genérico cuando no hay mensaje', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/test',
        ok: false,
        status: 500,
        data: {},
      },
    ]);
    const { default: apiClient } = await import('../../services/apiClient');
    await expect(apiClient('/test')).rejects.toThrow(
      'No fue posible comunicarse con el servidor.'
    );
  });
});
