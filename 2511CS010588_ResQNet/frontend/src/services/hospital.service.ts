import api from './api';
import type {
  ApiResponse,
  CreateHospitalPayload,
  Hospital,
  HospitalStatus,
  UpdateBedsPayload,
} from '../types';

export const hospitalService = {
  async getAll(status?: HospitalStatus): Promise<Hospital[]> {
    const response = await api.get<ApiResponse<Hospital[]>>('/hospitals', {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  async getNearby(lat: number, lon: number, radiusKm = 25.0): Promise<Hospital[]> {
    const response = await api.get<ApiResponse<Hospital[]>>('/hospitals/nearby', {
      params: { lat, lon, radiusKm },
    });
    return response.data.data;
  },

  async getById(id: number, lat?: number, lon?: number): Promise<Hospital> {
    const response = await api.get<ApiResponse<Hospital>>(`/hospitals/${id}`, {
      params: { lat, lon },
    });
    return response.data.data;
  },

  async create(payload: CreateHospitalPayload): Promise<Hospital> {
    const response = await api.post<ApiResponse<Hospital>>('/hospitals', payload);
    return response.data.data;
  },

  async updateBeds(id: number, payload: UpdateBedsPayload): Promise<Hospital> {
    const response = await api.patch<ApiResponse<Hospital>>(`/hospitals/${id}/beds`, payload);
    return response.data.data;
  },

  async updateStatus(id: number, status: HospitalStatus): Promise<Hospital> {
    const response = await api.patch<ApiResponse<Hospital>>(`/hospitals/${id}/status`, null, {
      params: { status },
    });
    return response.data.data;
  },
};

export default hospitalService;
