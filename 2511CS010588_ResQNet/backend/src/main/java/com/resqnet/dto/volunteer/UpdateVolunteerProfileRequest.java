package com.resqnet.dto.volunteer;

import com.resqnet.enums.AvailabilityStatus;
import com.resqnet.enums.BloodGroup;

public class UpdateVolunteerProfileRequest {

    private String skills;
    private AvailabilityStatus availabilityStatus;
    private Double preferredRadiusKm;
    private String phone;
    private BloodGroup bloodGroup;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String address;
    private Double currentLatitude;
    private Double currentLongitude;

    public UpdateVolunteerProfileRequest() {
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public Double getPreferredRadiusKm() {
        return preferredRadiusKm;
    }

    public void setPreferredRadiusKm(Double preferredRadiusKm) {
        this.preferredRadiusKm = preferredRadiusKm;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(Double currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public Double getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(Double currentLongitude) {
        this.currentLongitude = currentLongitude;
    }
}
