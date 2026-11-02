import { apiClient } from './client';

export const careerApi = {
  async getAllCareers() {
    return await apiClient('/api/careers', { method: 'GET' });
  },

  async getCareerById(id) {
    return await apiClient(`/api/careers/${id}`, { method: 'GET' });
  },

  async getRecommendations() {
    return await apiClient('/api/careers/recommendations', { method: 'GET' });
  },

  async getCareerMatch(careerId) {
    return await apiClient(`/api/careers/${careerId}/match`, { method: 'GET' });
  },
};
