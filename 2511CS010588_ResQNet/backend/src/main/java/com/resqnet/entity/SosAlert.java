package com.resqnet.entity;

import com.resqnet.enums.EmergencyType;
import com.resqnet.enums.SosPriority;
import com.resqnet.enums.SosStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sos_alerts")
public class SosAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 255)
    private String locationName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmergencyType emergencyType = EmergencyType.GENERAL_LIFE_THREAT;

    @Column(nullable = false)
    private Integer trappedCount = 1;

    @Column(nullable = false)
    private Boolean medicalAttentionNeeded = false;

    @Column(columnDefinition = "TEXT")
    private String additionalNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SosStatus status = SosStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SosPriority priority = SosPriority.CRITICAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_id")
    private User assignedTeam;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    public SosAlert() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public User getAssignedTeam() {
        return assignedTeam;
    }

    public void setAssignedTeam(User assignedTeam) {
        this.assignedTeam = assignedTeam;
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
