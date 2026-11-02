import { apiClient } from './client';

export const skillGapApi = {
  async analyzeGap(careerId) {
    return await apiClient(`/api/skill-gap/career/${careerId}`, { method: 'GET' });
  },

  async markSkillCompleted(careerId, skillName) {
    return await apiClient('/api/skill-gap/mark-skill-completed', {
      body: { careerId, skillName },
    });
  },
};
