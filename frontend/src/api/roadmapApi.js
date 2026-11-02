import { apiClient } from './client';

export const roadmapApi = {
  async getMyRoadmaps() {
    return await apiClient('/api/roadmaps/my-roadmaps', { method: 'GET' });
  },

  async getRoadmapByCareer(careerId) {
    return await apiClient(`/api/roadmaps/career/${careerId}`, { method: 'GET' });
  },

  async startRoadmap(careerId) {
    return await apiClient(`/api/roadmaps/start/${careerId}`, { method: 'POST' });
  },

  async toggleTask(roadmapId, taskId) {
    return await apiClient(`/api/roadmaps/${roadmapId}/toggle-task`, {
      method: 'PUT',
      body: { taskId },
    });
  },

  async resetRoadmap(roadmapId) {
    return await apiClient(`/api/roadmaps/${roadmapId}/reset`, { method: 'PUT' });
  },
};
