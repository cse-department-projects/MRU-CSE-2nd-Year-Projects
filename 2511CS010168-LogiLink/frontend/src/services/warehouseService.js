import { apiFetch } from './apiClient.js';

export const warehouseService = {
  list: () => apiFetch('/warehouses'),
  getById: (id) => apiFetch(`/warehouses/${id}`),
  create: (payload) => apiFetch('/warehouses', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateStatus: (id, status) => apiFetch(`/warehouses/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => apiFetch(`/warehouses/${id}`, { method: 'DELETE' }),
};
