const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let csrfToken = '';

const isMutatingMethod = (method) =>
  ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

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
    ...options.headers,
  };

  if (isMutatingMethod(method)) {
    headers['X-CSRF-Token'] = await getCsrfToken();
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });

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