import api from './api';
import type {
  ApiResponse,
  CreateDisasterPayload,
  DisasterReport,
  DisasterStatus,
  DisasterType,
  Severity,
  VerifyDisasterPayload,
} from '../types';

export const disasterService = {
  async create(payload: CreateDisasterPayload): Promise<DisasterReport> {
    const response = await api.post<ApiResponse<DisasterReport>>('/disasters', payload);
    return response.data.data;
  },

  async getAll(params?: {
    type?: DisasterType;
    severity?: Severity;
    status?: DisasterStatus;
  }): Promise<DisasterReport[]> {
    const response = await api.get<ApiResponse<DisasterReport[]>>('/disasters', { params });
    return response.data.data;
  },

  async getNearby(lat: number, lon: number, radiusKm = 25.0): Promise<DisasterReport[]> {
    const response = await api.get<ApiResponse<DisasterReport[]>>('/disasters/nearby', {
      params: { lat, lon, radiusKm },
    });
    return response.data.data;
  },

  async getMyReports(): Promise<DisasterReport[]> {
    const response = await api.get<ApiResponse<DisasterReport[]>>('/disasters/my-reports');
    return response.data.data;
  },

  async getById(id: number, lat?: number, lon?: number): Promise<DisasterReport> {
    const response = await api.get<ApiResponse<DisasterReport>>(`/disasters/${id}`, {
      params: { lat, lon },
    });
    return response.data.data;
  },

  async verify(id: number, payload: VerifyDisasterPayload): Promise<DisasterReport> {
    const response = await api.patch<ApiResponse<DisasterReport>>(`/disasters/${id}/verify`, payload);
    return response.data.data;
  },

  async updateStatus(id: number, status: DisasterStatus): Promise<DisasterReport> {
    const response = await api.patch<ApiResponse<DisasterReport>>(`/disasters/${id}/status`, null, {
      params: { status },
    });
    return response.data.data;
  },
};

export default disasterService;
