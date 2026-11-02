package com.resqnet.service;

import com.resqnet.dto.sos.AssignSosRequest;
import com.resqnet.dto.sos.RescueUnitSummaryResponse;
import com.resqnet.dto.sos.SosAlertResponse;
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
import com.resqnet.repository.RescueTeamProfileRepository;
import com.resqnet.repository.SosAlertRepository;
import com.resqnet.repository.UserRepository;
import com.resqnet.dto.sos.TriggerSosRequest;
import com.resqnet.dto.sos.UpdateSosStatusRequest;
import com.resqnet.service.NotificationService;
import com.resqnet.service.impl.SosServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SosAssignmentServiceTest {

    @Mock
    private SosAlertRepository sosAlertRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RescueTeamProfileRepository rescueTeamProfileRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SosServiceImpl sosService;

    private User citizenUser;
    private User rescueUser;
    private RescueTeamProfile rescueProfile;
    private SosAlert activeAlert;

    @BeforeEach
    void setUp() {
        citizenUser = new User();
        citizenUser.setId(10L);
        citizenUser.setFullName("Distressed Citizen");
        citizenUser.setEmail("citizen@resqnet.com");
        citizenUser.setPhone("+1234567890");

        rescueUser = new User();
        rescueUser.setId(20L);
        rescueUser.setFullName("Commander Sarah");
        rescueUser.setEmail("sarah@resqnet.com");
        rescueUser.setPhone("+1987654321");
        rescueUser.setRole(Role.RESCUE_TEAM);
        rescueUser.setIsActive(true);

        rescueProfile = new RescueTeamProfile(rescueUser);
        rescueProfile.setId(100L);
        rescueProfile.setUnitName("Squad Delta 1");
        rescueProfile.setCallSign("DELTA-1");
        rescueProfile.setTeamType(TeamType.FLOOD_RESCUE);
        rescueProfile.setOperationalStatus(OperationalStatus.STANDBY);
        rescueProfile.setMemberCount(4);
        rescueUser.setRescueTeamProfile(rescueProfile);

        activeAlert = new SosAlert();
        activeAlert.setId(500L);
        activeAlert.setUser(citizenUser);
        activeAlert.setLatitude(12.9716);
        activeAlert.setLongitude(77.5946);
        activeAlert.setLocationName("Sector 7 Lowlands");
        activeAlert.setEmergencyType(EmergencyType.WATER_LEVEL_RISING);
        activeAlert.setTrappedCount(3);
        activeAlert.setMedicalAttentionNeeded(true);
        activeAlert.setStatus(SosStatus.ACTIVE);
        activeAlert.setPriority(SosPriority.CRITICAL);
        activeAlert.setCreatedAt(LocalDateTime.now().minusMinutes(5));
    }

    @Test
    @DisplayName("Successfully assign eligible rescue unit and transition unit operationalStatus from STANDBY to DISPATCHED")
    void testSuccessfulAssignmentAndUnitStatusUpdate() {
        when(sosAlertRepository.findById(500L)).thenReturn(Optional.of(activeAlert));
        when(userRepository.findById(20L)).thenReturn(Optional.of(rescueUser));
        when(sosAlertRepository.save(any(SosAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AssignSosRequest request = new AssignSosRequest(20L);
        SosAlertResponse response = sosService.assignSos(500L, request);

        assertNotNull(response);
        assertEquals(SosStatus.ASSIGNED, response.getStatus());
        assertEquals(20L, response.getAssignedTeamId());
        assertEquals("Squad Delta 1", response.getAssignedTeamName());
        assertEquals("FLOOD_RESCUE", response.getAssignedTeamType());
        assertEquals("DELTA-1", response.getAssignedCallSign());

        // Verify profile was updated to DISPATCHED
        assertEquals(OperationalStatus.DISPATCHED, rescueProfile.getOperationalStatus());
        verify(rescueTeamProfileRepository, times(1)).save(rescueProfile);
        verify(sosAlertRepository, times(1)).save(activeAlert);

        // Verify notifications were sent to citizen and rescue responder
        verify(notificationService, times(1)).sendNotification(
                eq(citizenUser),
                eq("Rescue Squad Dispatched"),
                anyString(),
                eq(NotificationType.SOS_ALERT),
                eq("/citizen")
        );
        verify(notificationService, times(1)).sendNotification(
                eq(rescueUser),
                eq("New Rescue Mission Assigned"),
                anyString(),
                eq(NotificationType.SOS_ALERT),
                eq("/rescue")
        );
    }

    @Test
    @DisplayName("Reject assignment when SOS alert is already RESOLVED")
    void testRejectionWhenAlertResolved() {
        activeAlert.setStatus(SosStatus.RESOLVED);
        when(sosAlertRepository.findById(500L)).thenReturn(Optional.of(activeAlert));

        AssignSosRequest request = new AssignSosRequest(20L);
        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                sosService.assignSos(500L, request)
        );

        assertTrue(exception.getMessage().contains("Cannot assign resolved or cancelled SOS emergency alert"));
        verify(sosAlertRepository, never()).save(any());
        verify(rescueTeamProfileRepository, never()).save(any());
    }

    @Test
    @DisplayName("Reject assignment when target rescue user is inactive")
    void testRejectionWhenTargetUserInactive() {
        rescueUser.setIsActive(false);
        when(sosAlertRepository.findById(500L)).thenReturn(Optional.of(activeAlert));
        when(userRepository.findById(20L)).thenReturn(Optional.of(rescueUser));

        AssignSosRequest request = new AssignSosRequest(20L);
        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                sosService.assignSos(500L, request)
        );

        assertTrue(exception.getMessage().contains("inactive"));
        assertEquals(SosStatus.ACTIVE, activeAlert.getStatus());
        assertNull(activeAlert.getAssignedTeam());
        verify(sosAlertRepository, never()).save(any());
    }

    @Test
    @DisplayName("Reject assignment when target rescue unit is OFF_DUTY")
    void testRejectionWhenTargetUnitOffDuty() {
        rescueProfile.setOperationalStatus(OperationalStatus.OFF_DUTY);
        when(sosAlertRepository.findById(500L)).thenReturn(Optional.of(activeAlert));
        when(userRepository.findById(20L)).thenReturn(Optional.of(rescueUser));

        AssignSosRequest request = new AssignSosRequest(20L);
        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                sosService.assignSos(500L, request)
        );

        assertTrue(exception.getMessage().contains("OFF_DUTY"));
        assertEquals(SosStatus.ACTIVE, activeAlert.getStatus());
        assertNull(activeAlert.getAssignedTeam());
        verify(sosAlertRepository, never()).save(any());
    }

    @Test
    @DisplayName("Roster retrieval returns active rescue units with workload and availability")
    void testGetRescueUnitsRoster() {
        when(userRepository.findByRoleAndIsActiveOrderByCreatedAtDesc(Role.RESCUE_TEAM, true))
                .thenReturn(List.of(rescueUser));
        when(sosAlertRepository.countByAssignedTeamIdAndStatusIn(eq(20L), anyList()))
                .thenReturn(2L);

        List<RescueUnitSummaryResponse> roster = sosService.getRescueUnits();

        assertNotNull(roster);
        assertEquals(1, roster.size());
        RescueUnitSummaryResponse unit = roster.get(0);
        assertEquals(20L, unit.getUserId());
        assertEquals("Squad Delta 1", unit.getUnitName());
        assertEquals(TeamType.FLOOD_RESCUE, unit.getTeamType());
        assertEquals(OperationalStatus.STANDBY, unit.getOperationalStatus());
        assertEquals(2L, unit.getActiveAssignmentCount());
        assertTrue(unit.getIsAvailable());
    }

    @Test
    @DisplayName("Triggering SOS notifies all active rescue teams")
    void testTriggerSosNotifiesActiveRescueTeams() {
        when(userRepository.findByEmail("citizen@resqnet.com")).thenReturn(Optional.of(citizenUser));
        when(userRepository.save(any(User.class))).thenReturn(citizenUser);
        when(sosAlertRepository.save(any(SosAlert.class))).thenAnswer(invocation -> {
            SosAlert a = invocation.getArgument(0);
            a.setId(999L);
            return a;
        });
        when(userRepository.findByRoleAndIsActiveOrderByCreatedAtDesc(Role.RESCUE_TEAM, true))
                .thenReturn(List.of(rescueUser));

        TriggerSosRequest request = new TriggerSosRequest();
        request.setLatitude(12.9716);
        request.setLongitude(77.5946);
        request.setLocationName("Sector 7 Lowlands");
        request.setEmergencyType(EmergencyType.WATER_LEVEL_RISING);
        request.setTrappedCount(3);
        request.setMedicalAttentionNeeded(true);

        SosAlertResponse response = sosService.triggerSos(request, "citizen@resqnet.com");

        assertNotNull(response);
        assertEquals(999L, response.getId());
        verify(notificationService, times(1)).sendNotification(
                eq(rescueUser),
                contains("EMERGENCY SOS"),
                contains("Critical SOS beacon #999"),
                eq(NotificationType.SOS_ALERT),
                eq("/rescue")
        );
    }

    @Test
    @DisplayName("Status updates send milestone notifications to citizen on actual transition")
    void testStatusTransitionNotifications() {
        when(sosAlertRepository.findById(500L)).thenReturn(Optional.of(activeAlert));
        when(sosAlertRepository.save(any(SosAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // 1. ACTIVE -> ACKNOWLEDGED
        UpdateSosStatusRequest ackReq = new UpdateSosStatusRequest();
        ackReq.setStatus(SosStatus.ACKNOWLEDGED);
        sosService.updateSosStatus(500L, ackReq);

        verify(notificationService, times(1)).sendNotification(
                eq(citizenUser),
                eq("SOS Beacon Acknowledged"),
                contains("acknowledged by Rescue Command"),
                eq(NotificationType.SOS_ALERT),
                eq("/citizen")
        );

        // 2. ACKNOWLEDGED -> IN_RESCUE
        UpdateSosStatusRequest rescueReq = new UpdateSosStatusRequest();
        rescueReq.setStatus(SosStatus.IN_RESCUE);
        sosService.updateSosStatus(500L, rescueReq);

        verify(notificationService, times(1)).sendNotification(
                eq(citizenUser),
                eq("Rescue Responders On-Site"),
                contains("active extraction/assistance operations"),
                eq(NotificationType.SOS_ALERT),
                eq("/citizen")
        );

        // 3. Duplicate update: IN_RESCUE -> IN_RESCUE should NOT send duplicate notification
        sosService.updateSosStatus(500L, rescueReq);
        verify(notificationService, times(1)).sendNotification(
                eq(citizenUser),
                eq("Rescue Responders On-Site"),
                anyString(),
                any(),
                anyString()
        );

        // 4. IN_RESCUE -> RESOLVED
        UpdateSosStatusRequest resolveReq = new UpdateSosStatusRequest();
        resolveReq.setStatus(SosStatus.RESOLVED);
        sosService.updateSosStatus(500L, resolveReq);

        verify(notificationService, times(1)).sendNotification(
                eq(citizenUser),
                eq("Emergency Rescue Resolved"),
                contains("safely rescued and completed"),
                eq(NotificationType.SOS_ALERT),
                eq("/citizen")
        );
    }
}

