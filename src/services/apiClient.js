const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const isTest = import.meta.env.MODE === 'test';
const REQUEST_TIMEOUT = isTest ? 0 : 30000;

let csrfToken = '';
let authToken = null;

const isMutatingMethod = (method) =>
  ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

export const getApiAuthToken = () => authToken;

export const setApiAuthToken = (token) => {
  authToken = token;
  if (token) {
    try {
      sessionStorage.setItem('authToken', token);
    } catch {
      // ignore storage errors
    }
  } else {
    try {
      sessionStorage.removeItem('authToken');
    } catch {
      // ignore storage errors
    }
  }
};

export const clearApiAuthToken = () => {
  authToken = null;
  try {
    sessionStorage.removeItem('authToken');
  } catch {
    // ignore storage errors
  }
};

const restoreAuthToken = () => {
  try {
    const stored = sessionStorage.getItem('authToken');
    if (stored) {
      authToken = stored;
    }
  } catch {
    // ignore storage errors
  }
};

restoreAuthToken();

const getCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch(`${API_URL}/csrf-token`, {
    method: 'GET',
    credentials: 'include',
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.data?.token) {
    throw new Error(
      body.message || 'No fue posible obtener el token CSRF.'
    );
  }

  csrfToken = body.data.token;

  return csrfToken;
};

const apiClient = async (path, options = {}) => {
  const method = options.method?.toUpperCase();

  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  if (isMutatingMethod(method)) {
    headers['X-CSRF-Token'] = await getCsrfToken();
  }

  let response;

  if (REQUEST_TIMEOUT > 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      response = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        headers,
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(
          'La solicitud tardó demasiado tiempo. Por favor, inténtalo de nuevo.'
        );
      }

      throw error;
    }
  } else {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers,
      ...options,
    });
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('cartItems');

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    throw new Error(
      body.message || 'No fue posible comunicarse con el servidor.'
    );
  }

  return body.data;
};

export default apiClient;
