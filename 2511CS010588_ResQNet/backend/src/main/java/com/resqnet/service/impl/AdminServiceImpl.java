package com.resqnet.service.impl;

import com.resqnet.dto.admin.AdminStatsResponse;
import com.resqnet.dto.admin.AdminUserSummaryResponse;
import com.resqnet.entity.Hospital;
import com.resqnet.entity.User;
import com.resqnet.enums.*;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.*;
import com.resqnet.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final SosAlertRepository sosAlertRepository;
    private final DisasterReportRepository disasterReportRepository;
    private final ShelterRepository shelterRepository;
    private final HospitalRepository hospitalRepository;
    private final VolunteerTaskRepository volunteerTaskRepository;

    public AdminServiceImpl(
            UserRepository userRepository,
            SosAlertRepository sosAlertRepository,
            DisasterReportRepository disasterReportRepository,
            ShelterRepository shelterRepository,
            HospitalRepository hospitalRepository,
            VolunteerTaskRepository volunteerTaskRepository) {
        this.userRepository = userRepository;
        this.sosAlertRepository = sosAlertRepository;
        this.disasterReportRepository = disasterReportRepository;
        this.shelterRepository = shelterRepository;
        this.hospitalRepository = hospitalRepository;
        this.volunteerTaskRepository = volunteerTaskRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserSummaryResponse> getAllUsers(Role role, Boolean isActive) {
        List<User> users;
        if (role != null && isActive != null) {
            users = userRepository.findByRoleAndIsActiveOrderByCreatedAtDesc(role, isActive);
        } else if (role != null) {
            users = userRepository.findByRoleOrderByCreatedAtDesc(role);
        } else if (isActive != null) {
            users = userRepository.findByIsActiveOrderByCreatedAtDesc(isActive);
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }

        return users.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserSummaryResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return mapToSummary(user);
    }

    @Override
    @Transactional
    public AdminUserSummaryResponse updateUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(isActive);
        User saved = userRepository.save(user);
        return mapToSummary(saved);
    }

    @Override
    @Transactional
    public AdminUserSummaryResponse updateUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setRole(role);
        User saved = userRepository.save(user);
        return mapToSummary(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        AdminStatsResponse stats = new AdminStatsResponse();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalCitizens(userRepository.countByRole(Role.CITIZEN));
        stats.setTotalVolunteers(userRepository.countByRole(Role.VOLUNTEER));
        stats.setTotalRescueTeams(userRepository.countByRole(Role.RESCUE_TEAM));
        stats.setActiveUsers(userRepository.countByIsActive(true));

        // Active SOS = ACTIVE, ASSIGNED, IN_RESCUE
        long activeSos = sosAlertRepository.findAll().stream()
                .filter(s -> s.getStatus() == SosStatus.ACTIVE || s.getStatus() == SosStatus.ASSIGNED || s.getStatus() == SosStatus.IN_RESCUE)
                .count();
        stats.setActiveSosCount(activeSos);

        // Verified Disasters
        long verifiedDisasters = disasterReportRepository.findAll().stream()
                .filter(d -> d.getStatus() == DisasterStatus.VERIFIED || d.getStatus() == DisasterStatus.IN_PROGRESS)
                .count();
        stats.setVerifiedDisasterCount(verifiedDisasters);

        // Open Shelters
        long openShelters = shelterRepository.findByStatus(ShelterStatus.OPEN).size();
        stats.setOpenShelterCount(openShelters);

        // Hospitals & available beds
        List<Hospital> hospitals = hospitalRepository.findAll();
        long operationalHospitals = hospitals.stream().filter(h -> h.getStatus() == HospitalStatus.OPERATIONAL).count();
        long totalBeds = hospitals.stream().mapToLong(h -> (long) h.getAvailableGeneralBeds() + h.getAvailableIcuBeds()).sum();
        stats.setOperationalHospitalsCount(operationalHospitals);
        stats.setTotalAvailableBeds(totalBeds);

        // Tasks
        stats.setTotalTasks(volunteerTaskRepository.count());
        stats.setActiveTasks(volunteerTaskRepository.countByStatus(TaskStatus.OPEN) + volunteerTaskRepository.countByStatus(TaskStatus.ASSIGNED) + volunteerTaskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        stats.setCompletedTasks(volunteerTaskRepository.countByStatus(TaskStatus.COMPLETED));

        return stats;
    }

    private AdminUserSummaryResponse mapToSummary(User user) {
        AdminUserSummaryResponse res = new AdminUserSummaryResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setPhone(user.getPhone());
        res.setRole(user.getRole());
        res.setBloodGroup(user.getBloodGroup());
        res.setIsActive(user.getIsActive());
        res.setAddress(user.getAddress());
        res.setCreatedAt(user.getCreatedAt());

        if (user.getVolunteerProfile() != null) {
            res.setVolunteerPoints(user.getVolunteerProfile().getTotalPoints());
            res.setVolunteerTier(user.getVolunteerProfile().getCurrentTier());
            res.setVolunteerVerified(user.getVolunteerProfile().getIsVerified());
        }

        if (user.getRescueTeamProfile() != null) {
            res.setRescueUnitName(user.getRescueTeamProfile().getUnitName());
            if (user.getRescueTeamProfile().getTeamType() != null) {
                res.setRescueTeamType(user.getRescueTeamProfile().getTeamType().name());
            }
        }

        return res;
    }
}
