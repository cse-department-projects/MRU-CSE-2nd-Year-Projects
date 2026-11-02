package com.resqnet.service.impl;

import com.resqnet.dto.volunteer.LeaderboardEntryResponse;
import com.resqnet.dto.volunteer.UpdateVolunteerProfileRequest;
import com.resqnet.dto.volunteer.VolunteerProfileResponse;
import com.resqnet.entity.User;
import com.resqnet.entity.VolunteerProfile;
import com.resqnet.enums.AvailabilityStatus;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.UserRepository;
import com.resqnet.repository.VolunteerProfileRepository;
import com.resqnet.service.VolunteerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class VolunteerServiceImpl implements VolunteerService {

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;

    public VolunteerServiceImpl(UserRepository userRepository, VolunteerProfileRepository volunteerProfileRepository) {
        this.userRepository = userRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
    }

    @Override
    @Transactional
    public VolunteerProfileResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        VolunteerProfile profile = user.getVolunteerProfile();
        if (profile == null) {
            profile = new VolunteerProfile(user);
            profile = volunteerProfileRepository.save(profile);
            user.setVolunteerProfile(profile);
        }

        int rank = calculateRank(profile.getTotalPoints());
        return mapToResponse(user, profile, rank);
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerProfileResponse getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        VolunteerProfile profile = user.getVolunteerProfile();
        if (profile == null) {
            throw new ResourceNotFoundException("Volunteer profile not found for user: " + userId);
        }

        int rank = calculateRank(profile.getTotalPoints());
        return mapToResponse(user, profile, rank);
    }

    @Override
    @Transactional
    public VolunteerProfileResponse updateProfile(String email, UpdateVolunteerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getBloodGroup() != null) user.setBloodGroup(request.getBloodGroup());
        if (request.getEmergencyContactName() != null) user.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCurrentLatitude() != null) user.setCurrentLatitude(request.getCurrentLatitude());
        if (request.getCurrentLongitude() != null) user.setCurrentLongitude(request.getCurrentLongitude());
        userRepository.save(user);

        VolunteerProfile profile = user.getVolunteerProfile();
        if (profile == null) {
            profile = new VolunteerProfile(user);
        }

        if (request.getSkills() != null) profile.setSkills(request.getSkills().trim());
        if (request.getAvailabilityStatus() != null) profile.setAvailabilityStatus(request.getAvailabilityStatus());
        if (request.getPreferredRadiusKm() != null && request.getPreferredRadiusKm() > 0) {
            profile.setPreferredRadiusKm(request.getPreferredRadiusKm());
        }

        VolunteerProfile savedProfile = volunteerProfileRepository.save(profile);
        int rank = calculateRank(savedProfile.getTotalPoints());
        return mapToResponse(user, savedProfile, rank);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getLeaderboard(int limit) {
        List<VolunteerProfile> topProfiles = volunteerProfileRepository.findAllByOrderByTotalPointsDesc();
        List<LeaderboardEntryResponse> result = new ArrayList<>();

        int currentRank = 1;
        for (VolunteerProfile p : topProfiles) {
            if (p.getUser() == null) continue;
            result.add(new LeaderboardEntryResponse(
                    p.getUser().getId(),
                    p.getUser().getFullName(),
                    p.getTotalPoints(),
                    p.getTasksCompleted(),
                    p.getCurrentTier(),
                    p.getIsVerified(),
                    currentRank++
            ));
            if (limit > 0 && result.size() >= limit) break;
        }

        return result;
    }

    @Override
    @Transactional
    public VolunteerProfileResponse verifyVolunteer(Long volunteerProfileId, boolean verified) {
        VolunteerProfile profile = volunteerProfileRepository.findById(volunteerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found: " + volunteerProfileId));

        profile.setIsVerified(verified);
        VolunteerProfile saved = volunteerProfileRepository.save(profile);
        int rank = calculateRank(saved.getTotalPoints());
        return mapToResponse(saved.getUser(), saved, rank);
    }

    @Override
    @Transactional
    public void awardTaskPoints(Long volunteerUserId, int points) {
        User user = userRepository.findById(volunteerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + volunteerUserId));

        VolunteerProfile profile = user.getVolunteerProfile();
        if (profile == null) {
            profile = new VolunteerProfile(user);
        }

        int newPoints = (profile.getTotalPoints() != null ? profile.getTotalPoints() : 0) + points;
        int newTasks = (profile.getTasksCompleted() != null ? profile.getTasksCompleted() : 0) + 1;

        profile.setTotalPoints(newPoints);
        profile.setTasksCompleted(newTasks);

        // Update Gamification Tiers based on points & tasks
        if (newPoints >= 1000 || newTasks >= 20) {
            profile.setCurrentTier("PLATINUM");
        } else if (newPoints >= 500 || newTasks >= 10) {
            profile.setCurrentTier("GOLD");
        } else if (newPoints >= 200 || newTasks >= 4) {
            profile.setCurrentTier("SILVER");
        } else {
            profile.setCurrentTier("BRONZE");
        }

        volunteerProfileRepository.save(profile);
    }

    private int calculateRank(Integer points) {
        if (points == null || points == 0) return 1;
        List<VolunteerProfile> all = volunteerProfileRepository.findAllByOrderByTotalPointsDesc();
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).getTotalPoints() <= points) {
                return i + 1;
            }
        }
        return all.size() + 1;
    }

    private VolunteerProfileResponse mapToResponse(User user, VolunteerProfile profile, int rank) {
        VolunteerProfileResponse res = new VolunteerProfileResponse();
        res.setId(profile.getId());
        res.setUserId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setPhone(user.getPhone());
        res.setRole(user.getRole());
        res.setBloodGroup(user.getBloodGroup());
        res.setEmergencyContactName(user.getEmergencyContactName());
        res.setEmergencyContactPhone(user.getEmergencyContactPhone());
        res.setCurrentLatitude(user.getCurrentLatitude());
        res.setCurrentLongitude(user.getCurrentLongitude());
        res.setAddress(user.getAddress());

        res.setSkills(profile.getSkills());
        res.setAvailabilityStatus(profile.getAvailabilityStatus() != null ? profile.getAvailabilityStatus() : AvailabilityStatus.AVAILABLE);
        res.setTotalPoints(profile.getTotalPoints() != null ? profile.getTotalPoints() : 0);
        res.setTasksCompleted(profile.getTasksCompleted() != null ? profile.getTasksCompleted() : 0);
        res.setCurrentTier(profile.getCurrentTier() != null ? profile.getCurrentTier() : "BRONZE");
        res.setIsVerified(profile.getIsVerified() != null ? profile.getIsVerified() : false);
        res.setPreferredRadiusKm(profile.getPreferredRadiusKm() != null ? profile.getPreferredRadiusKm() : 10.0);
        res.setLeaderboardRank(rank);
        res.setUpdatedAt(profile.getUpdatedAt());
        return res;
    }
}
