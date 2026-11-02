import { apiClient } from './client';

export const resourceApi = {
  async getResources({ skill, difficulty, type } = {}) {
    const params = new URLSearchParams();
    if (skill && skill !== 'All') params.append('skill', skill);
    if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
    if (type && type !== 'All') params.append('type', type);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiClient(`/api/resources${query}`, { method: 'GET' });
  },
};
