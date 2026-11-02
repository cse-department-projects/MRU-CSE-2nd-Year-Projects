package com.resqnet.dto.disaster;

import com.resqnet.enums.DisasterType;
import com.resqnet.enums.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateDisasterReportRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Disaster type is required")
    private DisasterType disasterType;

    @NotNull(message = "Severity is required")
    private Severity severity = Severity.MEDIUM;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String locationName;
    private String mediaUrls;
    private Integer estimatedAffectedPeople = 0;

    public CreateDisasterReportRequest() {
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
}
