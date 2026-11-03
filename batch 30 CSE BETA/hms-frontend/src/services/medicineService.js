import api from '../api/axios';

export const medicineService = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  updateStock: (id, quantityChange) => api.patch(`/medicines/${id}/stock`, null, { params: { quantityChange } }),
  getLowStock: () => api.get('/medicines/low-stock'),
  getExpiring: () => api.get('/medicines/expiring'),
  getCategories: () => api.get('/medicines/categories'),
};
