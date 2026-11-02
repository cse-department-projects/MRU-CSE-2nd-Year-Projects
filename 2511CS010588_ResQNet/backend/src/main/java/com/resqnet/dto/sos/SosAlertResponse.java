package com.resqnet.dto.sos;

import com.resqnet.enums.BloodGroup;
import com.resqnet.enums.EmergencyType;
import com.resqnet.enums.SosPriority;
import com.resqnet.enums.SosStatus;

import java.time.LocalDateTime;

public class SosAlertResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userPhone;
    private BloodGroup userBloodGroup;
    private String userEmergencyContactName;
    private String userEmergencyContactPhone;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private EmergencyType emergencyType;
    private Integer trappedCount;
    private Boolean medicalAttentionNeeded;
    private String additionalNotes;
    private SosStatus status;
    private SosPriority priority;
    private Long assignedTeamId;
    private String assignedTeamName;
    private String assignedTeamPhone;
    private String assignedTeamType;
    private String assignedCallSign;
    private String assignedOperationalStatus;
    private Double distanceKm;
    private Integer triageScore;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public SosAlertResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public BloodGroup getUserBloodGroup() {
        return userBloodGroup;
    }

    public void setUserBloodGroup(BloodGroup userBloodGroup) {
        this.userBloodGroup = userBloodGroup;
    }

    public String getUserEmergencyContactName() {
        return userEmergencyContactName;
    }

    public void setUserEmergencyContactName(String userEmergencyContactName) {
        this.userEmergencyContactName = userEmergencyContactName;
    }

    public String getUserEmergencyContactPhone() {
        return userEmergencyContactPhone;
    }

    public void setUserEmergencyContactPhone(String userEmergencyContactPhone) {
        this.userEmergencyContactPhone = userEmergencyContactPhone;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public EmergencyType getEmergencyType() {
        return emergencyType;
    }

    public void setEmergencyType(EmergencyType emergencyType) {
        this.emergencyType = emergencyType;
    }

    public Integer getTrappedCount() {
        return trappedCount;
    }

    public void setTrappedCount(Integer trappedCount) {
        this.trappedCount = trappedCount;
    }

    public Boolean getMedicalAttentionNeeded() {
        return medicalAttentionNeeded;
    }

    public void setMedicalAttentionNeeded(Boolean medicalAttentionNeeded) {
        this.medicalAttentionNeeded = medicalAttentionNeeded;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    public SosStatus getStatus() {
        return status;
    }

    public void setStatus(SosStatus status) {
        this.status = status;
    }

    public SosPriority getPriority() {
        return priority;
    }

    public void setPriority(SosPriority priority) {
        this.priority = priority;
    }

    public Long getAssignedTeamId() {
        return assignedTeamId;
    }

    public void setAssignedTeamId(Long assignedTeamId) {
        this.assignedTeamId = assignedTeamId;
    }

    public String getAssignedTeamName() {
        return assignedTeamName;
    }

    public void setAssignedTeamName(String assignedTeamName) {
        this.assignedTeamName = assignedTeamName;
    }

    public String getAssignedTeamPhone() {
        return assignedTeamPhone;
    }

    public void setAssignedTeamPhone(String assignedTeamPhone) {
        this.assignedTeamPhone = assignedTeamPhone;
    }

    public String getAssignedTeamType() {
        return assignedTeamType;
    }

    public void setAssignedTeamType(String assignedTeamType) {
        this.assignedTeamType = assignedTeamType;
    }

    public String getAssignedCallSign() {
        return assignedCallSign;
    }

    public void setAssignedCallSign(String assignedCallSign) {
        this.assignedCallSign = assignedCallSign;
    }

    public String getAssignedOperationalStatus() {
        return assignedOperationalStatus;
    }

    public void setAssignedOperationalStatus(String assignedOperationalStatus) {
        this.assignedOperationalStatus = assignedOperationalStatus;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getTriageScore() {
        return triageScore;
    }

    public void setTriageScore(Integer triageScore) {
        this.triageScore = triageScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
