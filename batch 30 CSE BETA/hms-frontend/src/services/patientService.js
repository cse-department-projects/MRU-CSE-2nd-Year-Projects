import api from '../api/axios';

export const patientService = {
  getMyProfile: () => api.get('/patients/me'),
  updateMyProfile: (data) => api.put('/patients/me', data),
  getById: (id) => api.get(`/patients/${id}`),
  getAll: (params) => api.get('/admin/patients', { params }),
  update: (id, data) => api.put(`/admin/patients/${id}`, data),
  delete: (id) => api.delete(`/admin/patients/${id}`),
};
