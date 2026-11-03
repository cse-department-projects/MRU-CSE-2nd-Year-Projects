import api from '../api/axios';

export const auditLogService = {
  getAll: (params) => api.get('/admin/audit-logs', { params }),
};

