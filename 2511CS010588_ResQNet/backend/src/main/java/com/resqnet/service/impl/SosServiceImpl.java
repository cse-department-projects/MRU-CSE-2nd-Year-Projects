package com.resqnet.service.impl;

import com.resqnet.dto.sos.AssignSosRequest;
import com.resqnet.dto.sos.RescueUnitSummaryResponse;
import com.resqnet.dto.sos.SosAlertResponse;
import com.resqnet.dto.sos.TriggerSosRequest;
import com.resqnet.dto.sos.UpdateSosStatusRequest;
import com.resqnet.entity.RescueTeamProfile;
import com.resqnet.entity.SosAlert;
import com.resqnet.entity.User;
import com.resqnet.enums.EmergencyType;
import com.resqnet.enums.NotificationType;
import com.resqnet.enums.OperationalStatus;
import com.resqnet.enums.Role;
import com.resqnet.enums.SosPriority;
import com.resqnet.enums.SosStatus;
import com.resqnet.enums.TeamType;
import com.resqnet.exception.BadRequestException;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.RescueTeamProfileRepository;
import com.resqnet.repository.SosAlertRepository;
import com.resqnet.repository.UserRepository;
import com.resqnet.service.NotificationService;
import com.resqnet.service.SosService;
import com.resqnet.util.GeoUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SosServiceImpl implements SosService {

    private final SosAlertRepository sosAlertRepository;
    private final UserRepository userRepository;
    private final RescueTeamProfileRepository rescueTeamProfileRepository;
    private final NotificationService notificationService;

    public SosServiceImpl(SosAlertRepository sosAlertRepository,
                          UserRepository userRepository,
                          RescueTeamProfileRepository rescueTeamProfileRepository,
                          NotificationService notificationService) {
        this.sosAlertRepository = sosAlertRepository;
        this.userRepository = userRepository;
        this.rescueTeamProfileRepository = rescueTeamProfileRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public SosAlertResponse triggerSos(TriggerSosRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // Update user coordinates
        user.setCurrentLatitude(request.getLatitude());
        user.setCurrentLongitude(request.getLongitude());
        if (request.getLocationName() != null && !request.getLocationName().isBlank()) {
            user.setAddress(request.getLocationName());
        }
        userRepository.save(user);

        // Calculate deterministic triage score and priority tier
        int triageScore = calculateTriageScore(
                request.getEmergencyType(),
                request.getTrappedCount(),
                request.getMedicalAttentionNeeded()
        );
        SosPriority calculatedPriority = determinePriority(triageScore);

        SosAlert alert = new SosAlert();
        alert.setUser(user);
        alert.setLatitude(request.getLatitude());
        alert.setLongitude(request.getLongitude());
        alert.setLocationName(request.getLocationName() != null ? request.getLocationName() : "GPS: " + request.getLatitude() + ", " + request.getLongitude());
        alert.setEmergencyType(request.getEmergencyType() != null ? request.getEmergencyType() : EmergencyType.GENERAL_LIFE_THREAT);
        alert.setTrappedCount(request.getTrappedCount() != null && request.getTrappedCount() > 0 ? request.getTrappedCount() : 1);
        alert.setMedicalAttentionNeeded(Boolean.TRUE.equals(request.getMedicalAttentionNeeded()));
        alert.setAdditionalNotes(request.getAdditionalNotes());
        alert.setStatus(SosStatus.ACTIVE);
        alert.setPriority(calculatedPriority);

        SosAlert saved = sosAlertRepository.save(alert);

        // Notify active rescue teams of incoming emergency beacon
        List<User> activeRescueTeams = userRepository.findByRoleAndIsActiveOrderByCreatedAtDesc(Role.RESCUE_TEAM, true);
        String sosTypeFormatted = saved.getEmergencyType().name().replace('_', ' ');
        for (User responder : activeRescueTeams) {
            notificationService.sendNotification(
                    responder,
                    "🚨 EMERGENCY SOS: " + sosTypeFormatted,
                    "Critical SOS beacon #" + saved.getId() + " at " + saved.getLocationName() + " (" + saved.getTrappedCount() + " trapped). Immediate response required.",
                    NotificationType.SOS_ALERT,
                    "/rescue"
            );
        }

        return mapToResponse(saved, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SosAlertResponse> getActiveSosQueue(Double lat, Double lon) {
        List<SosStatus> activeStatuses = List.of(
                SosStatus.ACTIVE,
                SosStatus.ACKNOWLEDGED,
                SosStatus.ASSIGNED,
                SosStatus.IN_RESCUE
        );

        List<SosAlert> alerts = sosAlertRepository.findByStatusInOrderByCreatedAtDesc(activeStatuses);

        return alerts.stream()
                .map(alert -> mapToResponse(alert, lat, lon))
                .sorted(Comparator
                        .comparing(SosAlertResponse::getTriageScore, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(SosAlertResponse::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                )
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SosAlertResponse getMyActiveSos(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        List<SosStatus> activeStatuses = List.of(
                SosStatus.ACTIVE,
                SosStatus.ACKNOWLEDGED,
                SosStatus.ASSIGNED,
                SosStatus.IN_RESCUE
        );

        return sosAlertRepository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(user.getId(), activeStatuses)
                .map(alert -> mapToResponse(alert, null, null))
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SosAlertResponse> getMySosHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return sosAlertRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(alert -> mapToResponse(alert, null, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SosAlertResponse getSosById(Long id) {
        SosAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS alert not found with id: " + id));

        return mapToResponse(alert, null, null);
    }

    @Override
    @Transactional
    public SosAlertResponse assignSos(Long id, AssignSosRequest request) {
        SosAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS alert not found with id: " + id));

        // Reject assignment if alert is resolved or cancelled
        if (alert.getStatus() == SosStatus.RESOLVED || alert.getStatus() == SosStatus.FALSE_ALARM) {
            throw new BadRequestException("Cannot assign resolved or cancelled SOS emergency alert #" + id);
        }

        User team = userRepository.findById(request.getRescueTeamUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Rescue team unit not found with id: " + request.getRescueTeamUserId()));

        // Check if responder is active
        if (!Boolean.TRUE.equals(team.getIsActive())) {
            throw new BadRequestException("Target rescue unit is inactive and cannot accept emergency assignments");
        }

        if (team.getRole() != Role.RESCUE_TEAM && team.getRole() != Role.ADMIN) {
            throw new BadRequestException("Target user is not a verified rescue team unit");
        }

        // Validate operational status if profile exists
        RescueTeamProfile profile = team.getRescueTeamProfile();
        if (profile == null) {
            profile = rescueTeamProfileRepository.findByUserId(team.getId()).orElse(null);
        }

        if (profile != null) {
            if (profile.getOperationalStatus() == OperationalStatus.OFF_DUTY) {
                throw new BadRequestException("Target rescue unit (" + (profile.getUnitName() != null ? profile.getUnitName() : team.getFullName()) + ") is currently OFF_DUTY and cannot accept emergency dispatches");
            }
            // Update operational status to DISPATCHED if currently STANDBY
            if (profile.getOperationalStatus() == OperationalStatus.STANDBY) {
                profile.setOperationalStatus(OperationalStatus.DISPATCHED);
                rescueTeamProfileRepository.save(profile);
            }
        }

        // Avoid duplicate assignment mutations if already assigned to this exact team
        if (alert.getAssignedTeam() != null && alert.getAssignedTeam().getId().equals(team.getId()) && alert.getStatus() == SosStatus.ASSIGNED) {
            return mapToResponse(alert, null, null);
        }

        alert.setAssignedTeam(team);
        if (alert.getStatus() == SosStatus.ACTIVE || alert.getStatus() == SosStatus.ACKNOWLEDGED) {
            alert.setStatus(SosStatus.ASSIGNED);
        }

        SosAlert updated = sosAlertRepository.save(alert);

        // Notify citizen of dispatched rescue squad
        String unitDisplay = (profile != null && profile.getUnitName() != null && !profile.getUnitName().isBlank())
                ? profile.getUnitName()
                : team.getFullName();
        String specDisplay = (profile != null && profile.getTeamType() != null)
                ? " (" + profile.getTeamType().name().replace('_', ' ') + ")"
                : "";
        notificationService.sendNotification(
                updated.getUser(),
                "Rescue Squad Dispatched",
                "Squad " + unitDisplay + specDisplay + " has been assigned to your emergency and is en route.",
                NotificationType.SOS_ALERT,
                "/citizen"
        );

        // Notify assigned rescue responder of incoming mission
        notificationService.sendNotification(
                team,
                "New Rescue Mission Assigned",
                "You have been assigned to SOS #" + updated.getId() + " (" + updated.getEmergencyType().name().replace('_', ' ') + ") at " + updated.getLocationName() + " (" + updated.getTrappedCount() + " trapped).",
                NotificationType.SOS_ALERT,
                "/rescue"
        );

        return mapToResponse(updated, null, null);
    }

    @Override
    @Transactional
    public SosAlertResponse updateSosStatus(Long id, UpdateSosStatusRequest request) {
        SosAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS alert not found with id: " + id));

        SosStatus oldStatus = alert.getStatus();
        SosStatus newStatus = request.getStatus();

        alert.setStatus(newStatus);
        if (newStatus == SosStatus.RESOLVED || newStatus == SosStatus.FALSE_ALARM) {
            alert.setResolvedAt(LocalDateTime.now());

            // Check if assigned unit has other active tasks before moving back to STANDBY
            if (alert.getAssignedTeam() != null) {
                User assignedUser = alert.getAssignedTeam();
                List<SosStatus> activeStatuses = List.of(
                        SosStatus.ACTIVE,
                        SosStatus.ACKNOWLEDGED,
                        SosStatus.ASSIGNED,
                        SosStatus.IN_RESCUE
                );
                List<SosAlert> remaining = sosAlertRepository.findByAssignedTeamIdAndStatusInOrderByCreatedAtDesc(assignedUser.getId(), activeStatuses);
                boolean hasOtherActive = remaining.stream().anyMatch(a -> !a.getId().equals(alert.getId()));
                if (!hasOtherActive) {
                    RescueTeamProfile profile = assignedUser.getRescueTeamProfile();
                    if (profile == null) {
                        profile = rescueTeamProfileRepository.findByUserId(assignedUser.getId()).orElse(null);
                    }
                    if (profile != null && (profile.getOperationalStatus() == OperationalStatus.DISPATCHED || profile.getOperationalStatus() == OperationalStatus.ON_SITE)) {
                        profile.setOperationalStatus(OperationalStatus.STANDBY);
                        rescueTeamProfileRepository.save(profile);
                    }
                }
            }
        }

        SosAlert updated = sosAlertRepository.save(alert);

        // Send lifecycle notifications only when an actual status transition occurs
        if (oldStatus != newStatus) {
            if (newStatus == SosStatus.ACKNOWLEDGED) {
                notificationService.sendNotification(
                        updated.getUser(),
                        "SOS Beacon Acknowledged",
                        "Your emergency beacon #" + updated.getId() + " has been acknowledged by Rescue Command. Triage and unit assignment are in progress.",
                        NotificationType.SOS_ALERT,
                        "/citizen"
                );
            } else if (newStatus == SosStatus.IN_RESCUE) {
                notificationService.sendNotification(
                        updated.getUser(),
                        "Rescue Responders On-Site",
                        "Rescue personnel have arrived on-site and active extraction/assistance operations are underway for SOS #" + updated.getId() + ".",
                        NotificationType.SOS_ALERT,
                        "/citizen"
                );
            } else if (newStatus == SosStatus.RESOLVED) {
                notificationService.sendNotification(
                        updated.getUser(),
                        "Emergency Rescue Resolved",
                        "Your emergency beacon #" + updated.getId() + " has been marked as safely rescued and completed.",
                        NotificationType.SOS_ALERT,
                        "/citizen"
                );
            }
        }

        return mapToResponse(updated, null, null);
    }

    @Override
    @Transactional
    public SosAlertResponse cancelSos(Long id, String userEmail) {
        SosAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS alert not found with id: " + id));

        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (!alert.getUser().getId().equals(caller.getId()) && caller.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to cancel this SOS alert");
        }

        alert.setStatus(SosStatus.FALSE_ALARM);
        alert.setResolvedAt(LocalDateTime.now());

        SosAlert updated = sosAlertRepository.save(alert);
        return mapToResponse(updated, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RescueUnitSummaryResponse> getRescueUnits() {
        List<User> rescueUsers = userRepository.findByRoleAndIsActiveOrderByCreatedAtDesc(Role.RESCUE_TEAM, true);
        List<SosStatus> activeStatuses = List.of(
                SosStatus.ACTIVE,
                SosStatus.ACKNOWLEDGED,
                SosStatus.ASSIGNED,
                SosStatus.IN_RESCUE
        );

        return rescueUsers.stream().map(user -> {
            RescueUnitSummaryResponse res = new RescueUnitSummaryResponse();
            res.setUserId(user.getId());
            res.setFullName(user.getFullName());
            res.setEmail(user.getEmail());
            res.setPhone(user.getPhone());

            RescueTeamProfile profile = user.getRescueTeamProfile();
            if (profile == null) {
                profile = rescueTeamProfileRepository.findByUserId(user.getId()).orElse(null);
            }

            if (profile != null) {
                res.setUnitName(profile.getUnitName() != null && !profile.getUnitName().isBlank() ? profile.getUnitName() : user.getFullName());
                res.setCallSign(profile.getCallSign());
                res.setTeamType(profile.getTeamType() != null ? profile.getTeamType() : TeamType.DISASTER_RESPONSE_FORCE);
                res.setOperationalStatus(profile.getOperationalStatus() != null ? profile.getOperationalStatus() : OperationalStatus.STANDBY);
                res.setMemberCount(profile.getMemberCount());
                res.setVehicleType(profile.getVehicleType());
                res.setEquipmentList(profile.getEquipmentList());
            } else {
                res.setUnitName(user.getFullName());
                res.setTeamType(TeamType.DISASTER_RESPONSE_FORCE);
                res.setOperationalStatus(OperationalStatus.STANDBY);
                res.setMemberCount(1);
            }

            long activeCount = sosAlertRepository.countByAssignedTeamIdAndStatusIn(user.getId(), activeStatuses);
            res.setActiveAssignmentCount(activeCount);
            res.setIsAvailable(res.getOperationalStatus() != OperationalStatus.OFF_DUTY);

            return res;
        }).collect(Collectors.toList());
    }

    private SosAlertResponse mapToResponse(SosAlert alert, Double refLat, Double refLon) {
        SosAlertResponse res = new SosAlertResponse();
        res.setId(alert.getId());
        res.setUserId(alert.getUser().getId());
        res.setUserName(alert.getUser().getFullName());
        res.setUserPhone(alert.getUser().getPhone());
        res.setUserBloodGroup(alert.getUser().getBloodGroup());
        res.setUserEmergencyContactName(alert.getUser().getEmergencyContactName());
        res.setUserEmergencyContactPhone(alert.getUser().getEmergencyContactPhone());
        res.setLatitude(alert.getLatitude());
        res.setLongitude(alert.getLongitude());
        res.setLocationName(alert.getLocationName());
        res.setEmergencyType(alert.getEmergencyType());
        res.setTrappedCount(alert.getTrappedCount());
        res.setMedicalAttentionNeeded(alert.getMedicalAttentionNeeded());
        res.setAdditionalNotes(alert.getAdditionalNotes());
        res.setStatus(alert.getStatus());
        res.setPriority(alert.getPriority());

        int score = calculateTriageScore(alert.getEmergencyType(), alert.getTrappedCount(), alert.getMedicalAttentionNeeded());
        res.setTriageScore(score);

        if (alert.getAssignedTeam() != null) {
            User team = alert.getAssignedTeam();
            res.setAssignedTeamId(team.getId());
            res.setAssignedTeamName(team.getFullName());
            res.setAssignedTeamPhone(team.getPhone());

            RescueTeamProfile profile = team.getRescueTeamProfile();
            if (profile == null) {
                profile = rescueTeamProfileRepository.findByUserId(team.getId()).orElse(null);
            }

            if (profile != null) {
                if (profile.getUnitName() != null && !profile.getUnitName().isBlank()) {
                    res.setAssignedTeamName(profile.getUnitName());
                }
                if (profile.getTeamType() != null) {
                    res.setAssignedTeamType(profile.getTeamType().name());
                }
                if (profile.getCallSign() != null) {
                    res.setAssignedCallSign(profile.getCallSign());
                }
                if (profile.getOperationalStatus() != null) {
                    res.setAssignedOperationalStatus(profile.getOperationalStatus().name());
                }
            }
        }

        if (refLat != null && refLon != null && alert.getLatitude() != null && alert.getLongitude() != null) {
            res.setDistanceKm(Math.round(GeoUtils.calculateDistanceKm(refLat, refLon, alert.getLatitude(), alert.getLongitude()) * 100.0) / 100.0);
        }

        res.setCreatedAt(alert.getCreatedAt());
        res.setResolvedAt(alert.getResolvedAt());
        return res;
    }

    public static int calculateTriageScore(EmergencyType type, Integer trappedCount, Boolean medicalAttentionNeeded) {
        int score = 0;

        // Medical assistance required
        if (Boolean.TRUE.equals(medicalAttentionNeeded)) {
            score += 35;
        }

        // Trapped count scoring
        int safeCount = (trappedCount != null && trappedCount > 0) ? trappedCount : 1;
        if (safeCount >= 5) {
            score += 35;
        } else if (safeCount >= 3) {
            score += 25;
        } else if (safeCount == 2) {
            score += 15;
        } else {
            score += 5;
        }

        // Emergency type scoring
        if (type != null) {
            switch (type) {
                case WATER_LEVEL_RISING:
                case FIRE:
                    score += 25;
                    break;
                case GENERAL_LIFE_THREAT:
                    score += 20;
                    break;
                case MEDICAL:
                case TRAPPED:
                default:
                    score += 15;
                    break;
            }
        } else {
            score += 20;
        }

        return score;
    }

    public static SosPriority determinePriority(int score) {
        if (score >= 65) {
            return SosPriority.CRITICAL;
        } else if (score >= 45) {
            return SosPriority.URGENT;
        } else if (score >= 25) {
            return SosPriority.HIGH;
        } else {
            return SosPriority.MEDIUM;
        }
    }
}
