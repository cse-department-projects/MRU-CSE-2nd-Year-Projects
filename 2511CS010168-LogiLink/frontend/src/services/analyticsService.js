import { apiFetch } from './apiClient.js';

export const analyticsService = {
  summary: () => apiFetch('/analytics/summary'),
  orders: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/analytics/orders?${query}` : '/analytics/orders');
  },
  shipments: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/analytics/shipments?${query}` : '/analytics/shipments');
  },
  fleet: () => apiFetch('/analytics/fleet'),
  drivers: () => apiFetch('/analytics/drivers'),
  routes: () => apiFetch('/analytics/routes'),
  warehouses: () => apiFetch('/analytics/warehouses'),
  inventory: () => apiFetch('/analytics/inventory'),
  analytics: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/analytics?${query}` : '/analytics');
  },
  dashboard: () => apiFetch('/analytics/dashboard'),
  notifications: () => apiFetch('/notifications'),
};
