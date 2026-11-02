import api from './api';
import type {
  ApiResponse,
  LeaderboardEntry,
  UpdateVolunteerProfilePayload,
  VolunteerProfileResponse,
} from '../types';

export const volunteerService = {
  async getMyProfile(): Promise<VolunteerProfileResponse> {
    const response = await api.get<ApiResponse<VolunteerProfileResponse>>('/volunteer/profile');
    return response.data.data;
  },

  async updateMyProfile(payload: UpdateVolunteerProfilePayload): Promise<VolunteerProfileResponse> {
    const response = await api.put<ApiResponse<VolunteerProfileResponse>>('/volunteer/profile', payload);
    return response.data.data;
  },

  async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>('/volunteer/leaderboard', {
      params: { limit },
    });
    return response.data.data;
  },

  async verifyVolunteer(id: number, verified = true): Promise<VolunteerProfileResponse> {
    const response = await api.patch<ApiResponse<VolunteerProfileResponse>>(
      `/volunteer/${id}/verify`,
      null,
      { params: { verified } }
    );
    return response.data.data;
  },
};

export default volunteerService;
