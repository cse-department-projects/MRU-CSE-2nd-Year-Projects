import api from './api';
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from '../types';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return response.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};

export default authService;
