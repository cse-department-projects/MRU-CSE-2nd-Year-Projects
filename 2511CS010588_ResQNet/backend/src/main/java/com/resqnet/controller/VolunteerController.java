package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import com.resqnet.dto.volunteer.LeaderboardEntryResponse;
import com.resqnet.dto.volunteer.UpdateVolunteerProfileRequest;
import com.resqnet.dto.volunteer.VolunteerProfileResponse;
import com.resqnet.service.VolunteerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerController {

    private final VolunteerService volunteerService;

    public VolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> getMyProfile(Authentication authentication) {
        VolunteerProfileResponse profile = volunteerService.getProfileByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(profile, "Volunteer profile retrieved successfully"));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateVolunteerProfileRequest request,
            Authentication authentication) {
        VolunteerProfileResponse updated = volunteerService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Volunteer profile updated successfully"));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getLeaderboard(
            @RequestParam(required = false, defaultValue = "20") int limit) {
        List<LeaderboardEntryResponse> leaderboard = volunteerService.getLeaderboard(limit);
        return ResponseEntity.ok(ApiResponse.ok(leaderboard, "Volunteer leaderboard retrieved successfully"));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerProfileResponse>> verifyVolunteer(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean verified) {
        VolunteerProfileResponse verifiedProfile = volunteerService.verifyVolunteer(id, verified);
        return ResponseEntity.ok(ApiResponse.ok(verifiedProfile, "Volunteer certification status updated"));
    }
}
