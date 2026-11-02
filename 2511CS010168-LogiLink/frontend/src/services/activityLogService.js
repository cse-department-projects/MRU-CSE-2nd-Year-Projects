import { apiFetch } from './apiClient.js';

export const activityLogService = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.action && params.action !== 'All' && params.action !== 'ALL') {
      query.append('action', params.action);
    }
    if (params.entityType && params.entityType !== 'All' && params.entityType !== 'ALL') {
      query.append('entityType', params.entityType);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params.limit) {
      query.append('limit', params.limit);
    }
    const qs = query.toString();
    return apiFetch(`/activity-logs${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiFetch(`/activity-logs/${id}`),
};
