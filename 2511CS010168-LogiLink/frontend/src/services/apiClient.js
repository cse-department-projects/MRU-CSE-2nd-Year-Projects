const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'logilink_token';
const USER_KEY = 'logilink_user';

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSession({ token, user }) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (typeof body === 'object' && body ? (body.message || body.error) : null) || 'The request could not be completed.';
    const error = new Error(message);
    error.status = response.status;
    if (typeof body === 'object' && body?.validation) {
      error.validation = body.validation;
    }
    throw error;
  }

  return body;
}
