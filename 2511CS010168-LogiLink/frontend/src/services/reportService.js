import { apiFetch, apiUrl } from './apiClient.js';

export const reportService = {
  categories: () => apiFetch('/reports/categories'),
  preview: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/reports/preview?${query}` : '/reports/preview');
  },
  generate: (body) => apiFetch('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(body || {}),
  }),
  orders: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/reports/orders?${query}` : '/reports/orders');
  },
  shipments: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/reports/shipments?${query}` : '/reports/shipments');
  },
  fleet: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/reports/fleet?${query}` : '/reports/fleet');
  },
  drivers: () => apiFetch('/reports/drivers'),
  routes: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/reports/routes?${query}` : '/reports/routes');
  },
  warehouses: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/reports/warehouses?${query}` : '/reports/warehouses');
  },
  inventory: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(query ? `/reports/inventory?${query}` : '/reports/inventory');
  },
  exportCsv: async (params) => {
    const query = new URLSearchParams(params || {}).toString();
    const token = localStorage.getItem('logilink_token');
    const response = await fetch(apiUrl(`/reports/export?${query}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to export CSV report');
    return response.blob();
  },
};
