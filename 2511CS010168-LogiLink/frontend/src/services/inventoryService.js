import { apiFetch } from './apiClient.js';

export const inventoryService = {
  list: () => apiFetch('/inventory'),
  getById: (id) => apiFetch(`/inventory/${id}`),
  create: (payload) => apiFetch('/inventory', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adjust: (id, payload) => apiFetch(`/inventory/${id}/adjust`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => apiFetch(`/inventory/${id}`, { method: 'DELETE' }),
};
