package com.resqnet.dto.shelter;

import com.resqnet.enums.ShelterStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateShelterRequest {

    @NotBlank(message = "Shelter name is required")
    private String name;

    private String type = "COMMUNITY_HALL";

    @NotNull(message = "Total capacity is required")
    private Integer totalCapacity = 100;

    private Integer currentOccupancy = 0;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Address is required")
    private String address;

    private String contactPerson;
    private String contactPhone;
    private Boolean foodAvailable = true;
    private Boolean medicalSupportAvailable = true;
    private Boolean petFriendly = true;
    private Boolean powerBackup = true;
    private ShelterStatus status = ShelterStatus.OPEN;

    public CreateShelterRequest() {
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
}
