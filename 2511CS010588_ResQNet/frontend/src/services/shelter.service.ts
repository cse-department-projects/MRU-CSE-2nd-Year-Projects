import api from './api';
import type {
  ApiResponse,
  CreateShelterPayload,
  Shelter,
  ShelterStatus,
  UpdateOccupancyPayload,
} from '../types';

export const shelterService = {
  async getAll(status?: ShelterStatus): Promise<Shelter[]> {
    const response = await api.get<ApiResponse<Shelter[]>>('/shelters', {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  async getNearby(lat: number, lon: number, radiusKm = 25.0): Promise<Shelter[]> {
    const response = await api.get<ApiResponse<Shelter[]>>('/shelters/nearby', {
      params: { lat, lon, radiusKm },
    });
    return response.data.data;
  },

  async getById(id: number, lat?: number, lon?: number): Promise<Shelter> {
    const response = await api.get<ApiResponse<Shelter>>(`/shelters/${id}`, {
      params: { lat, lon },
    });
    return response.data.data;
  },

  async create(payload: CreateShelterPayload): Promise<Shelter> {
    const response = await api.post<ApiResponse<Shelter>>('/shelters', payload);
    return response.data.data;
  },

  async updateOccupancy(id: number, currentOccupancy: number): Promise<Shelter> {
    const payload: UpdateOccupancyPayload = { currentOccupancy };
    const response = await api.patch<ApiResponse<Shelter>>(`/shelters/${id}/occupancy`, payload);
    return response.data.data;
  },

  async updateStatus(id: number, status: ShelterStatus): Promise<Shelter> {
    const response = await api.patch<ApiResponse<Shelter>>(`/shelters/${id}/status`, null, {
      params: { status },
    });
    return response.data.data;
  },
};

export default shelterService;
