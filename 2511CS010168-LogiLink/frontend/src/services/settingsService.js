import { apiFetch } from './apiClient.js';

export const settingsService = {
  getSettings: () => apiFetch('/settings'),
  updateProfile: (data) => apiFetch('/settings/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updateCompany: (data) => apiFetch('/settings/company', { method: 'PUT', body: JSON.stringify(data) }),
  updateNotifications: (data) => apiFetch('/settings/notifications', { method: 'PUT', body: JSON.stringify(data) }),
  updateAppearance: (data) => apiFetch('/settings/appearance', { method: 'PUT', body: JSON.stringify(data) }),
  updateSecurity: (data) => apiFetch('/settings/security', { method: 'PUT', body: JSON.stringify(data) }),
  updateSystem: (data) => apiFetch('/settings/system', { method: 'PUT', body: JSON.stringify(data) }),
  updateSettings: (data) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
