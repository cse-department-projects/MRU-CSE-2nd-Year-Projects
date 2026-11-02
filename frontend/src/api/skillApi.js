import { apiClient } from './client';

export const skillApi = {
  async getCatalog() {
    return await apiClient('/api/skills/catalog', { method: 'GET' });
  },

  async getMySkills() {
    return await apiClient('/api/skills/my-skills', { method: 'GET' });
  },

  async addSkill(skillData) {
    return await apiClient('/api/skills/my-skills', { body: skillData });
  },

  async updateProficiency(skillId, proficiency) {
    return await apiClient(`/api/skills/my-skills/${skillId}`, {
      method: 'PUT',
      body: { proficiency },
    });
  },

  async removeSkill(skillId) {
    return await apiClient(`/api/skills/my-skills/${skillId}`, { method: 'DELETE' });
  },
};
