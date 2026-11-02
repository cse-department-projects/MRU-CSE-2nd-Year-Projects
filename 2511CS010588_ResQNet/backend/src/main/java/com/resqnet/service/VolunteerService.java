package com.resqnet.service;

import com.resqnet.dto.volunteer.LeaderboardEntryResponse;
import com.resqnet.dto.volunteer.UpdateVolunteerProfileRequest;
import com.resqnet.dto.volunteer.VolunteerProfileResponse;

import java.util.List;

public interface VolunteerService {
    VolunteerProfileResponse getProfileByEmail(String email);
    VolunteerProfileResponse getProfileByUserId(Long userId);
    VolunteerProfileResponse updateProfile(String email, UpdateVolunteerProfileRequest request);
    List<LeaderboardEntryResponse> getLeaderboard(int limit);
    VolunteerProfileResponse verifyVolunteer(Long volunteerProfileId, boolean verified);
    void awardTaskPoints(Long volunteerUserId, int points);
}
