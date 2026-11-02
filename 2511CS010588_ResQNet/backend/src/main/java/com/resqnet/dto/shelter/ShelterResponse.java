package com.resqnet.dto.shelter;

import com.resqnet.enums.ShelterStatus;
import java.time.LocalDateTime;

public class ShelterResponse {

    private Long id;
    private String name;
    private String type;
    private Integer totalCapacity;
    private Integer currentOccupancy;
    private Integer availableCapacity;
    private Double occupancyPercentage;
    private Double latitude;
    private Double longitude;
    private String address;
    private String contactPerson;
    private String contactPhone;
    private Boolean foodAvailable;
    private Boolean medicalSupportAvailable;
    private Boolean petFriendly;
    private Boolean powerBackup;
    private ShelterStatus status;
    private Double distanceKm;
    private LocalDateTime updatedAt;

    public ShelterResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }

    public Integer getCurrentOccupancy() {
        return currentOccupancy;
    }

    public void setCurrentOccupancy(Integer currentOccupancy) {
        this.currentOccupancy = currentOccupancy;
    }

    public Integer getAvailableCapacity() {
        return availableCapacity;
    }

    public void setAvailableCapacity(Integer availableCapacity) {
        this.availableCapacity = availableCapacity;
    }

    public Double getOccupancyPercentage() {
        return occupancyPercentage;
    }

    public void setOccupancyPercentage(Double occupancyPercentage) {
        this.occupancyPercentage = occupancyPercentage;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public Boolean getFoodAvailable() {
        return foodAvailable;
    }

    public void setFoodAvailable(Boolean foodAvailable) {
        this.foodAvailable = foodAvailable;
    }

    public Boolean getMedicalSupportAvailable() {
        return medicalSupportAvailable;
    }

    public void setMedicalSupportAvailable(Boolean medicalSupportAvailable) {
        this.medicalSupportAvailable = medicalSupportAvailable;
    }

    public Boolean getPetFriendly() {
        return petFriendly;
    }

    public void setPetFriendly(Boolean petFriendly) {
        this.petFriendly = petFriendly;
    }

    public Boolean getPowerBackup() {
        return powerBackup;
    }

    public void setPowerBackup(Boolean powerBackup) {
        this.powerBackup = powerBackup;
    }

    public ShelterStatus getStatus() {
        return status;
    }

    public void setStatus(ShelterStatus status) {
        this.status = status;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
