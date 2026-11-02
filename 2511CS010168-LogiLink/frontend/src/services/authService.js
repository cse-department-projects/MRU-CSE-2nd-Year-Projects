import { apiFetch, clearSession, getStoredUser, setSession } from './apiClient.js';

function normalizeUser(user) {
  if (!user) return user;
  const roleLabels = {
    ADMIN: 'Logistics Administrator',
    MANAGER: 'Logistics Manager',
    OPERATOR: 'Logistics Operator',
  };
  return { ...user, role: roleLabels[user.role] || user.role, rawRole: user.role };
}

export const authService = {
  login: async (email, password) => {
    const result = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const user = normalizeUser(result.user);
    setSession({ token: result.token, user });
    return user;
  },
  register: async (payload) => {
    const result = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const user = normalizeUser(result.user);
    setSession({ token: result.token, user });
    return user;
  },
  demoLogin: () => authService.login('admin@logilink.edu', 'LogiLink@123'),
  currentUser: async () => {
    const stored = getStoredUser();
    if (!stored) return null;
    try {
      const user = normalizeUser(await apiFetch('/auth/me'));
      setSession({ token: window.localStorage.getItem('logilink_token'), user });
      return user;
    } catch {
      clearSession();
      return null;
    }
  },
  updateUserSession: (user, token) => {
    const normalized = normalizeUser(user);
    const currentToken = token || window.localStorage.getItem('logilink_token');
    setSession({ token: currentToken, user: normalized });
    return normalized;
  },
  logout: () => {
    clearSession();
  },
  storedUser: getStoredUser,
  forgotPassword: async (email) => {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  verifyResetToken: async (token) => {
    return apiFetch(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },
  resetPassword: async (token, newPassword) => {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};
