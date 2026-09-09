const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'oasis_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * The API answers every failure with { error: { message, details? } }, so the
 * whole app can rely on this one shape.
 */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// AuthContext registers a handler so an expired token logs the user out
// wherever it is noticed, without this module importing the router.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export async function request(path, options = {}) {
  const { method = 'GET', body, skipAuthHandler = false } = options;

  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      'Could not reach the server. Check that the API is running.'
    );
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // A rejected login is a failed attempt, not an expired session.
    if (response.status === 401 && !skipAuthHandler) {
      clearToken();
      onUnauthorized();
    }

    throw new ApiError(
      response.status,
      payload?.error?.message ?? 'Something went wrong',
      payload?.error?.details
    );
  }

  return payload;
}
