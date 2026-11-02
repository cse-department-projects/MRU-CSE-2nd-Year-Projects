import api from './api';
import type {
  ApiResponse,
  CreateTaskPayload,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  UpdateTaskStatusPayload,
  VolunteerTask,
} from '../types';

export const taskService = {
  async create(payload: CreateTaskPayload): Promise<VolunteerTask> {
    const response = await api.post<ApiResponse<VolunteerTask>>('/tasks', payload);
    return response.data.data;
  },

  async getAll(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
  }): Promise<VolunteerTask[]> {
    const response = await api.get<ApiResponse<VolunteerTask[]>>('/tasks', { params });
    return response.data.data;
  },

  async getAvailable(lat?: number, lon?: number, radiusKm = 30.0): Promise<VolunteerTask[]> {
    const response = await api.get<ApiResponse<VolunteerTask[]>>('/tasks/available', {
      params: { lat, lon, radiusKm },
    });
    return response.data.data;
  },

  async getMyTasks(): Promise<VolunteerTask[]> {
    const response = await api.get<ApiResponse<VolunteerTask[]>>('/tasks/my-tasks');
    return response.data.data;
  },

  async getById(id: number, lat?: number, lon?: number): Promise<VolunteerTask> {
    const response = await api.get<ApiResponse<VolunteerTask>>(`/tasks/${id}`, {
      params: { lat, lon },
    });
    return response.data.data;
  },

  async assign(id: number): Promise<VolunteerTask> {
    const response = await api.patch<ApiResponse<VolunteerTask>>(`/tasks/${id}/assign`);
    return response.data.data;
  },

  async updateStatus(id: number, payload: UpdateTaskStatusPayload): Promise<VolunteerTask> {
    const response = await api.patch<ApiResponse<VolunteerTask>>(`/tasks/${id}/status`, payload);
    return response.data.data;
  },

  async complete(id: number, completionNotes?: string): Promise<VolunteerTask> {
    const response = await api.patch<ApiResponse<VolunteerTask>>(`/tasks/${id}/complete`, null, {
      params: completionNotes ? { completionNotes } : undefined,
    });
    return response.data.data;
  },
};

export default taskService;
