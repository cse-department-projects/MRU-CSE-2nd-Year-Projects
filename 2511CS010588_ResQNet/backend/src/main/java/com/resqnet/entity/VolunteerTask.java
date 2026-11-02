package com.resqnet.entity;

import com.resqnet.enums.TaskCategory;
import com.resqnet.enums.TaskPriority;
import com.resqnet.enums.TaskStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_tasks")
public class VolunteerTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TaskCategory category = TaskCategory.LOGISTICS;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.OPEN;

    @Column(nullable = false)
    private Integer pointsReward = 50;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false, length = 255)
    private String locationName;

    @Column(length = 30)
    private String contactPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_volunteer_id")
    private User assignedVolunteer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disaster_report_id")
    private DisasterReport relatedDisaster;

    private LocalDateTime assignedAt;

    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String completionNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public VolunteerTask() {
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskCategory getCategory() {
        return category;
    }

    public void setCategory(TaskCategory category) {
        this.category = category;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Integer getPointsReward() {
        return pointsReward;
    }

    public void setPointsReward(Integer pointsReward) {
        this.pointsReward = pointsReward;
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

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getAssignedVolunteer() {
        return assignedVolunteer;
    }

    public void setAssignedVolunteer(User assignedVolunteer) {
        this.assignedVolunteer = assignedVolunteer;
    }

    public DisasterReport getRelatedDisaster() {
        return relatedDisaster;
    }

    public void setRelatedDisaster(DisasterReport relatedDisaster) {
        this.relatedDisaster = relatedDisaster;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getCompletionNotes() {
        return completionNotes;
    }

    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
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
