package com.resqnet.dto.sos;

import com.resqnet.enums.EmergencyType;
import com.resqnet.enums.SosPriority;
import jakarta.validation.constraints.NotNull;

public class TriggerSosRequest {

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String locationName;
    private EmergencyType emergencyType = EmergencyType.GENERAL_LIFE_THREAT;
    private Integer trappedCount = 1;
    private Boolean medicalAttentionNeeded = false;
    private String additionalNotes;
    private SosPriority priority = SosPriority.CRITICAL;

    public TriggerSosRequest() {
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

    public SosPriority getPriority() {
        return priority;
    }

    public void setPriority(SosPriority priority) {
        this.priority = priority;
    }
}
