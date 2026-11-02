import { apiFetch } from './apiClient.js';

export const shipmentService = {
  list: () => apiFetch('/shipments'),
  getById: (id) => apiFetch(`/shipments/${id}`),
  stages: () => apiFetch('/shipments/stages'),
  tracking: (shipmentId) => apiFetch(`/tracking/${shipmentId}`),
  create: (payload) => apiFetch('/shipments', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/shipments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateStatus: (id, payload) => apiFetch(`/shipments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload),
  }),
  delete: (id) => apiFetch(`/shipments/${id}`, { method: 'DELETE' }),
};
