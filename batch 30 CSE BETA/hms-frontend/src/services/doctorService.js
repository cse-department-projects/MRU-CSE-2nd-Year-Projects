import api from '../api/axios';

export const doctorService = {
  getAvailable: () => api.get('/doctors/available'),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
  getAll: (params) => api.get('/admin/doctors', { params }),
  create: (data) => api.post('/admin/doctors', data),
  update: (id, data) => api.put(`/admin/doctors/${id}`, data),
  delete: (id) => api.delete(`/admin/doctors/${id}`),
  getMyProfile: () => api.get('/doctors/me'),
  updateMyProfile: (data) => api.put('/doctors/me', data),
};
