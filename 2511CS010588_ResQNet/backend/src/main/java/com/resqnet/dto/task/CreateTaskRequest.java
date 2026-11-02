package com.resqnet.dto.task;

import com.resqnet.enums.TaskCategory;
import com.resqnet.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    @NotBlank(message = "Task description is required")
    private String description;

    private TaskCategory category = TaskCategory.LOGISTICS;
    private TaskPriority priority = TaskPriority.MEDIUM;
    private Integer pointsReward = 50;

    @NotNull(message = "Task latitude is required")
    private Double latitude;

    @NotNull(message = "Task longitude is required")
    private Double longitude;

    @NotBlank(message = "Location address / name is required")
    private String locationName;

    private String contactPhone;
    private Long relatedDisasterId;

    public CreateTaskRequest() {
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

    public Long getRelatedDisasterId() {
        return relatedDisasterId;
    }

    public void setRelatedDisasterId(Long relatedDisasterId) {
        this.relatedDisasterId = relatedDisasterId;
    }
}
