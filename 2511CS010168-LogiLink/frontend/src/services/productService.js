import { apiFetch } from './apiClient.js';

export const productService = {
  list: () => apiFetch('/products'),
  getById: (id) => apiFetch(`/products/${id}`),
  create: (payload) => apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateStatus: (id, status) => apiFetch(`/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};
