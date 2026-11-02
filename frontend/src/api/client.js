import { handleMockRoute } from './mockData';

/**
 * Centralized HTTP API Client for Smart Career Guidance System
 * Connects to Spring Boot backend, manages JWT token headers,
 * handles 401 auth expiration gracefully, and provides structured fallback.
 */

const BASE_URL = '';
export const TOKEN_KEY = 'accessToken';

// Helper to get stored token from localStorage or sessionStorage
export function getStoredToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  );
}

// Helper to set stored token
export function setStoredToken(token, rememberMe = true) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('token', token); // backwards compatibility
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem('token', token);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token');
  }
}

// Helper to clear stored auth data
export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let data;
    try {
      data = await response.json();
    } catch (err) {
      data = { message: response.statusText || 'Unexpected server response.' };
    }

    if (response.ok) {
      return data;
    } else {
      // 401 Unauthorized - handle session expiry without infinite reload loops
      if (response.status === 401) {
        console.warn(`401 Unauthorized received for ${endpoint}. Session may have expired.`);
        // Only clear if calling protected endpoints other than login
        if (!endpoint.includes('/api/auth/login')) {
          clearStoredAuth();
        }
      }

      // If backend returned a 500/502/503/504 error, provide mock fallback
      if (
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {
        console.warn(
          `Backend returned ${response.status}. Using interactive fallback for: ${endpoint}`
        );
        return handleMockRoute(endpoint, config.method, body);
      }

      const errorMessage =
        data.message ||
        data.error ||
        'An unexpected server error occurred. Please try again.';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }
  } catch (err) {
    // If it's a 400/401/403/404 explicitly thrown with status, rethrow to caller
    if (err.status && err.status < 500) {
      throw err;
    }

    // Network connection failed / Backend offline
    console.warn(
      `Network connection failed or backend offline. Using fallback for: ${endpoint}`
    );
    return handleMockRoute(endpoint, config.method, body);
  }
}
