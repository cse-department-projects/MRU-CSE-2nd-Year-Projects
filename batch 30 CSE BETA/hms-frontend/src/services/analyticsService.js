import api from '../api/axios';

export const analyticsService = {
  getAdminAnalytics: () => api.get('/analytics/admin'),
  getDoctorAnalytics: () => api.get('/analytics/doctor'),
  getPharmacistAnalytics: () => api.get('/analytics/pharmacist'),
  getPatientAnalytics: () => api.get('/analytics/patient'),
};
