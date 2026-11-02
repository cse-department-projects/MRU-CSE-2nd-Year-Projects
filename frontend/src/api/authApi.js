import { apiClient } from './client';

export const authApi = {
  async login(credentials) {
    return await apiClient('/api/auth/login', { body: credentials });
  },

  async register(userData) {
    return await apiClient('/api/auth/register', { body: userData });
  },

  async forgotPassword(email) {
    return await apiClient('/api/auth/forgot-password', { body: { email } });
  },

  async resetPassword(resetData) {
    return await apiClient('/api/auth/reset-password', { body: resetData });
  },

  async changePassword(passwordData) {
    return await apiClient('/api/auth/change-password', { body: passwordData });
  },

  async getProfile() {
    return await apiClient('/api/user/profile', { method: 'GET' });
  },

  async updateProfile(profileData) {
    return await apiClient('/api/user/profile', { method: 'PUT', body: profileData });
  },

  async getDashboard() {
    return await apiClient('/api/dashboard', { method: 'GET' });
  },

  async getDashboardSummary() {
    return await apiClient('/api/dashboard', { method: 'GET' });
  },

  async logout() {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Client-side logout sufficient
    }
  },
};
