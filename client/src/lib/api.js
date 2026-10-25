const TOKEN_KEY = 'paylune_token';
const BASE_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const authToken = token ?? getToken();
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the Paylune server. Is it running?', 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some responses (such as a proxy error) may not be JSON.
  }

  if (!response.ok) {
    if (response.status === 401 && authToken && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event('paylune:session-expired'));
    }
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status);
  }

  return data;
}
