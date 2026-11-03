import api from '../api/axios';

export const dashboardService = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getDoctorDashboard: () => api.get('/dashboard/doctor'),
  getPatientDashboard: () => api.get('/dashboard/patient'),
  getPharmacistDashboard: () => api.get('/dashboard/pharmacist'),
};
