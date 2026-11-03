import api from '../api/axios';

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getById: (id) => api.get(`/prescriptions/${id}`),
  getByAppointment: (appointmentId) => api.get(`/prescriptions/appointment/${appointmentId}`),
  getByPatient: (patientId, params) => api.get(`/prescriptions/patient/${patientId}`, { params }),
  getByDoctor: (doctorId, params) => api.get(`/prescriptions/doctor/${doctorId}`, { params }),
};
