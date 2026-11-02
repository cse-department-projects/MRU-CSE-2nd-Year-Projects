import api from './api';
import type { ApiResponse, NotificationItem } from '../types';

export const notificationService = {
  async getAll(): Promise<NotificationItem[]> {
    const response = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/notifications/unread-count');
    return response.data.data;
  },

  async markAsRead(id: number): Promise<NotificationItem> {
    const response = await api.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch<ApiResponse<void>>('/notifications/mark-all-read');
  },
};

export default notificationService;
