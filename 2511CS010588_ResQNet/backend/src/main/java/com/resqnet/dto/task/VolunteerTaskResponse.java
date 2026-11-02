package com.resqnet.dto.task;

import com.resqnet.enums.TaskCategory;
import com.resqnet.enums.TaskPriority;
import com.resqnet.enums.TaskStatus;
import java.time.LocalDateTime;

public class VolunteerTaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskCategory category;
    private TaskPriority priority;
    private TaskStatus status;
    private Integer pointsReward;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private String contactPhone;
    private Long createdById;
    private String createdByName;
    private Long assignedVolunteerId;
    private String assignedVolunteerName;
    private Long relatedDisasterId;
    private Double distanceKm;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private String completionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VolunteerTaskResponse() {
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

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Long getAssignedVolunteerId() {
        return assignedVolunteerId;
    }

    public void setAssignedVolunteerId(Long assignedVolunteerId) {
        this.assignedVolunteerId = assignedVolunteerId;
    }

    public String getAssignedVolunteerName() {
        return assignedVolunteerName;
    }

    public void setAssignedVolunteerName(String assignedVolunteerName) {
        this.assignedVolunteerName = assignedVolunteerName;
    }

    public Long getRelatedDisasterId() {
        return relatedDisasterId;
    }

    public void setRelatedDisasterId(Long relatedDisasterId) {
        this.relatedDisasterId = relatedDisasterId;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
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
