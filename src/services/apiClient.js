const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getCsrfToken = () => {
  const cookie = document.cookie.split('; ').find((row) => row.startsWith('_csrf='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
};

const isMutatingMethod = (method) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

const apiClient = async (path, options = {}) => {
  const method = options.method?.toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (isMutatingMethod(method)) {
    headers['X-CSRF-Token'] = getCsrfToken();
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
