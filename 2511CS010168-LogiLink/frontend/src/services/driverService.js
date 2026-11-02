import { apiFetch } from './apiClient.js';

export const driverService = {
  list: () => apiFetch('/drivers'),
  getById: (id) => apiFetch(`/drivers/${id}`),
  create: (driver) =>
    apiFetch('/drivers', {
      method: 'POST',
      body: JSON.stringify(driver),
    }),
  update: (id, driver) =>
    apiFetch(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driver),
    }),
  updateStatus: (id, payload) =>
    apiFetch(`/drivers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id) =>
    apiFetch(`/drivers/${id}`, {
      method: 'DELETE',
    }),
};
