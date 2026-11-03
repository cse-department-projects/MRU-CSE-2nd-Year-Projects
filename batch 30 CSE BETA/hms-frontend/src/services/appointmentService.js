import api from '../api/axios';

export const appointmentService = {
  book: (data) => api.post('/appointments/book', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  getByPatient: (patientId, params) => api.get(`/appointments/patient/${patientId}`, { params }),
  getByDoctor: (doctorId, params) => api.get(`/appointments/doctor/${doctorId}`, { params }),
  confirm: (id) => api.put(`/appointments/${id}/confirm`),
  complete: (id, doctorNotes) => api.put(`/appointments/${id}/complete`, null, { params: { doctorNotes } }),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/doctors/${doctorId}/slots`, { params: { date } }),
};
