import api from './api';
import type {
  AdminStats,
  AdminUserSummary,
  ApiResponse,
  Role,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
} from '../types';

export const adminService = {
  async getUsers(params?: { role?: Role; isActive?: boolean }): Promise<AdminUserSummary[]> {
    const response = await api.get<ApiResponse<AdminUserSummary[]>>('/admin/users', { params });
    return response.data.data;
  },

  async getUserById(id: number): Promise<AdminUserSummary> {
    const response = await api.get<ApiResponse<AdminUserSummary>>(`/admin/users/${id}`);
    return response.data.data;
  },

  async updateUserStatus(id: number, payload: UpdateUserStatusPayload): Promise<AdminUserSummary> {
    const response = await api.patch<ApiResponse<AdminUserSummary>>(`/admin/users/${id}/status`, payload);
    return response.data.data;
  },

  async updateUserRole(id: number, payload: UpdateUserRolePayload): Promise<AdminUserSummary> {
    const response = await api.patch<ApiResponse<AdminUserSummary>>(`/admin/users/${id}/role`, payload);
    return response.data.data;
  },

  async getStats(): Promise<AdminStats> {
    const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data.data;
  },
};

export default adminService;
