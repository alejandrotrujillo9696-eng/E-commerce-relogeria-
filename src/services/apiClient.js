const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const isTest = import.meta.env.MODE === 'test';
const REQUEST_TIMEOUT = isTest ? 0 : 30000;

let csrfToken = '';

const isMutatingMethod = (method) =>
  ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

export const diagnosticLog = [];
export const resetDiagnosticLog = () => {
  diagnosticLog.length = 0;
};

const addDiagnosticStep = (step, status = 'pending', error = null) => {
  diagnosticLog.push({
    step,
    status,
    error: error ? { name: error.name, message: error.message } : null,
    timestamp: Date.now(),
  });
};

const getCsrfToken = async () => {
  if (csrfToken) {
    console.log('[API DEBUG] getCsrfToken reutilizado desde cache');
    addDiagnosticStep('getCsrfToken', 'completado', null);
    return csrfToken;
  }

  console.log('[API DEBUG] getCsrfToken GET /api/csrf-token iniciado');
  addDiagnosticStep('getCsrfToken', 'iniciado', null);
  const response = await fetch(`${API_URL}/csrf-token`, {
    method: 'GET',
    credentials: 'include',
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.data?.token) {
    console.log('[API DEBUG] getCsrfToken GET fallido, status:', response.status);
    addDiagnosticStep('getCsrfToken', 'error', { message: `status ${response.status}` });
    throw new Error(
      body.message || 'No fue posible obtener el token CSRF.'
    );
  }

  csrfToken = body.data.token;
  console.log('[API DEBUG] getCsrfToken GET completado');
  addDiagnosticStep('getCsrfToken', 'completado', null);

  return csrfToken;
};

let authToken = null;

export const setApiAuthToken = (token) => {
  authToken = token;
};

export const clearApiAuthToken = () => {
  authToken = null;
};

const apiClient = async (path, options = {}) => {
  const method = options.method?.toUpperCase();

  console.log('[API DEBUG] apiClient', path, 'iniciado');
  console.log('[API DEBUG] method:', method);
  console.log('[API DEBUG] authToken presente:', !!authToken);

  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken ? '...' : ''}` } : {}),
    ...options.headers,
  };

  if (isMutatingMethod(method)) {
    console.log('[API DEBUG] getCsrfToken iniciado');
    const csrfStart = Date.now();
    try {
      const csrf = await getCsrfToken();
      headers['X-CSRF-Token'] = csrf;
      console.log('[API DEBUG] getCsrfToken completado en', Date.now() - csrfStart, 'ms');
      console.log('[API DEBUG] X-CSRF-Token presente:', !!csrf);
    } catch (csrfError) {
      console.log('[API DEBUG] getCsrfToken error:', csrfError?.name, '-', csrfError?.message);
      addDiagnosticStep('fetch POST /api/orders', 'error', csrfError);
      throw csrfError;
    }
  }

  let response;

  if (REQUEST_TIMEOUT > 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      console.log('[API DEBUG] fetch', method, path, 'iniciado');
      addDiagnosticStep(`fetch ${method} ${path}`, 'iniciado', null);
      response = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        headers,
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('[API DEBUG] fetch', method, path, 'respuesta:', response.status);
      addDiagnosticStep(`fetch ${method} ${path}`, `respuesta ${response.status}`, null);
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('[API DEBUG] fetch', method, path, 'error:', error?.name, '-', error?.message);
      addDiagnosticStep(`fetch ${method} ${path}`, 'error', error);
      if (error.name === 'AbortError') {
        throw new Error(
          'La solicitud tardó demasiado tiempo. Por favor, inténtalo de nuevo.'
        );
      }

      throw error;
    }
  } else {
    console.log('[API DEBUG] fetch', method, path, 'iniciado');
    addDiagnosticStep(`fetch ${method} ${path}`, 'iniciado', null);
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers,
      ...options,
    });
    console.log('[API DEBUG] fetch', method, path, 'respuesta:', response.status);
    addDiagnosticStep(`fetch ${method} ${path}`, `respuesta ${response.status}`, null);
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