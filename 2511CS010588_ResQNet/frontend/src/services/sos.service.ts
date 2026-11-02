import api from './api';
import type { ApiResponse, RescueUnitSummary, SosAlert, SosStatus, TriggerSosPayload } from '../types';

export const sosService = {
  async trigger(payload: TriggerSosPayload): Promise<SosAlert> {
    const response = await api.post<ApiResponse<SosAlert>>('/sos/trigger', payload);
    return response.data.data;
  },

  async getRescueUnits(): Promise<RescueUnitSummary[]> {
    const response = await api.get<ApiResponse<RescueUnitSummary[]>>('/sos/rescue-units');
    return response.data.data;
  },

  async getActiveQueue(lat?: number, lon?: number): Promise<SosAlert[]> {
    const response = await api.get<ApiResponse<SosAlert[]>>('/sos/active', {
      params: { lat, lon },
    });
    return response.data.data;
  },

  async getMyActiveSos(): Promise<SosAlert | null> {
    const response = await api.get<ApiResponse<SosAlert | null>>('/sos/my-active');
    return response.data.data;
  },

  async getMyHistory(): Promise<SosAlert[]> {
    const response = await api.get<ApiResponse<SosAlert[]>>('/sos/my-history');
    return response.data.data;
  },

  async getById(id: number): Promise<SosAlert> {
    const response = await api.get<ApiResponse<SosAlert>>(`/sos/${id}`);
    return response.data.data;
  },

  async assign(id: number, rescueTeamUserId: number): Promise<SosAlert> {
    const response = await api.patch<ApiResponse<SosAlert>>(`/sos/${id}/assign`, {
      rescueTeamUserId,
    });
    return response.data.data;
  },

  async updateStatus(id: number, status: SosStatus): Promise<SosAlert> {
    const response = await api.patch<ApiResponse<SosAlert>>(`/sos/${id}/status`, { status });
    return response.data.data;
  },

  async cancel(id: number): Promise<SosAlert> {
    const response = await api.post<ApiResponse<SosAlert>>(`/sos/${id}/cancel`);
    return response.data.data;
  },
};

export default sosService;
