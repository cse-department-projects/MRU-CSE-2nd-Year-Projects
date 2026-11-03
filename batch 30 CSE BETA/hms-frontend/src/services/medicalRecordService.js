import api from '../api/axios';

export const medicalRecordService = {
  getById: (id) => api.get(`/medical-records/${id}`),
  getByPatient: (patientId, params) => api.get(`/medical-records/patient/${patientId}`, { params }),
  getByDoctor: (doctorId, params) => api.get(`/medical-records/doctor/${doctorId}`, { params }),
  create: (data) => api.post('/medical-records', data),
};
