import { apiClient } from './client';

export const internshipApi = {
  async getInternships({ search, workMode, location } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (workMode && workMode !== 'All') params.append('workMode', workMode);
    if (location && location !== 'All') params.append('location', location);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiClient(`/api/internships${query}`, { method: 'GET' });
  },

  async getRecommendedInternships() {
    return await apiClient('/api/internships/recommendations', { method: 'GET' });
  },

  async saveInternship(internshipId) {
    return await apiClient(`/api/internships/${internshipId}/save`, { method: 'POST' });
  },

  async unsaveInternship(internshipId) {
    return await apiClient(`/api/internships/${internshipId}/save`, { method: 'DELETE' });
  },

  async getSavedInternships() {
    return await apiClient('/api/internships/saved', { method: 'GET' });
  },
};
