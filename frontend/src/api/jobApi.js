import { apiClient } from './client';

export const jobApi = {
  async getJobs({ search, workMode, location, minMatch } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (workMode && workMode !== 'All') params.append('workMode', workMode);
    if (location && location !== 'All') params.append('location', location);
    if (minMatch) params.append('minMatch', minMatch);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiClient(`/api/jobs${query}`, { method: 'GET' });
  },

  async getRecommendedJobs() {
    return await apiClient('/api/jobs/recommendations', { method: 'GET' });
  },

  async saveJob(jobId) {
    return await apiClient(`/api/jobs/${jobId}/save`, { method: 'POST' });
  },

  async unsaveJob(jobId) {
    return await apiClient(`/api/jobs/${jobId}/save`, { method: 'DELETE' });
  },

  async getSavedJobs() {
    return await apiClient('/api/jobs/saved', { method: 'GET' });
  },
};
