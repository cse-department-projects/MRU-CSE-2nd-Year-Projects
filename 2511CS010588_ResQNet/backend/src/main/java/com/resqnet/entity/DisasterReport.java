package com.resqnet.entity;

import com.resqnet.enums.DisasterStatus;
import com.resqnet.enums.DisasterType;
import com.resqnet.enums.Severity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "disaster_reports")
public class DisasterReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private DisasterType disasterType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity = Severity.MEDIUM;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 255)
    private String locationName;

    @Column(columnDefinition = "TEXT")
    private String mediaUrls;

    private Integer estimatedAffectedPeople = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DisasterStatus status = DisasterStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_id")
    private User verifiedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public DisasterReport() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getReporter() {
        return reporter;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public DisasterType getDisasterType() {
        return disasterType;
    }

    public void setDisasterType(DisasterType disasterType) {
        this.disasterType = disasterType;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(String mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public Integer getEstimatedAffectedPeople() {
        return estimatedAffectedPeople;
    }

    public void setEstimatedAffectedPeople(Integer estimatedAffectedPeople) {
        this.estimatedAffectedPeople = estimatedAffectedPeople;
    }

    public DisasterStatus getStatus() {
        return status;
    }

    public void setStatus(DisasterStatus status) {
        this.status = status;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
