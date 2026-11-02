import { apiFetch } from './apiClient.js';

export const orderService = {
  list: () => apiFetch('/orders'),
  getById: (id) => apiFetch(`/orders/${id}`),
  create: (payload) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateStatus: (id, status) => apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
