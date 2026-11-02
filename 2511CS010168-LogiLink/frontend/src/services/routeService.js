import { apiFetch } from './apiClient.js';

export const routeService = {
  list: () => apiFetch('/routes'),
  getById: (id) => apiFetch(`/routes/${id}`),
  create: (route) =>
    apiFetch('/routes', {
      method: 'POST',
      body: JSON.stringify(route),
    }),
  update: (id, route) =>
    apiFetch(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(route),
    }),
  updateStatus: (id, payload) =>
    apiFetch(`/routes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id) =>
    apiFetch(`/routes/${id}`, {
      method: 'DELETE',
    }),
  optimize: (payload) =>
    apiFetch('/routes/optimize', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  searchLocations: (q) =>
    apiFetch(`/geo/search?q=${encodeURIComponent(q)}`),
  optimizeGeo: (payload) =>
    apiFetch('/geo/optimize', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  calculateGeoRoute: (payload) =>
    apiFetch('/geo/route', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
};
