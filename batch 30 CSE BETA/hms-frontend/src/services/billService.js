import api from '../api/axios';

export const billService = {
  generate: (data) => api.post('/bills', data),
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  getByAppointment: (appointmentId) => api.get(`/bills/appointment/${appointmentId}`),
  getByPatient: (patientId, params) => api.get(`/bills/patient/${patientId}`, { params }),
  markAsPaid: (id, paymentMethod) => api.put(`/bills/${id}/pay`, null, { params: { paymentMethod } }),
};
