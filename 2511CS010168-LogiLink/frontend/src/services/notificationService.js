import { apiFetch } from './apiClient.js';

export const notificationService = {
  list: (params = {}) => {
    if (typeof params === 'boolean') {
      return apiFetch(`/notifications${params ? '?unreadOnly=true' : ''}`);
    }
    const query = new URLSearchParams();
    if (params.unreadOnly) query.append('unreadOnly', 'true');
    if (params.type && params.type !== 'All' && params.type !== 'ALL') query.append('type', params.type);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    const qs = query.toString();
    return apiFetch(`/notifications${qs ? `?${qs}` : ''}`);
  },
  getUnreadCount: () => apiFetch('/notifications/unread-count'),
  getById: (id) => apiFetch(`/notifications/${id}`),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),
  delete: (id) => apiFetch(`/notifications/${id}`, { method: 'DELETE' }),
  create: (data) => apiFetch('/notifications', { method: 'POST', body: data }),
};
