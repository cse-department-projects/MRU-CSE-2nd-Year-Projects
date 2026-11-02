import { apiFetch } from './apiClient.js';

export const vehicleService = {
  list: () => apiFetch('/vehicles'),
  getById: (id) => apiFetch(`/vehicles/${id}`),
  tracking: () => apiFetch('/tracking'),
  create: (payload) => apiFetch('/vehicles', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateStatus: (id, payload) => apiFetch(`/vehicles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload),
  }),
  delete: (id) => apiFetch(`/vehicles/${id}`, { method: 'DELETE' }),
};
