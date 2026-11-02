package com.resqnet.dto.hospital;

import com.resqnet.enums.HospitalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateHospitalRequest {

    @NotBlank(message = "Hospital name is required")
    private String name;

    @NotNull(message = "Total beds count is required")
    private Integer totalBeds = 100;

    @NotNull(message = "Available general beds count is required")
    private Integer availableGeneralBeds = 50;

    @NotNull(message = "Available ICU beds count is required")
    private Integer availableIcuBeds = 10;

    @NotNull(message = "Available ventilators count is required")
    private Integer availableVentilators = 5;

    @NotBlank(message = "Emergency contact phone is required")
    private String emergencyPhone;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Address is required")
    private String address;

    private Boolean hasTraumaCenter = true;
    private Boolean hasBloodBank = true;
    private HospitalStatus status = HospitalStatus.OPERATIONAL;

    public CreateHospitalRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(Integer totalBeds) {
        this.totalBeds = totalBeds;
    }

    public Integer getAvailableGeneralBeds() {
        return availableGeneralBeds;
    }

    public void setAvailableGeneralBeds(Integer availableGeneralBeds) {
        this.availableGeneralBeds = availableGeneralBeds;
    }

    public Integer getAvailableIcuBeds() {
        return availableIcuBeds;
    }

    public void setAvailableIcuBeds(Integer availableIcuBeds) {
        this.availableIcuBeds = availableIcuBeds;
    }

    public Integer getAvailableVentilators() {
        return availableVentilators;
    }

    public void setAvailableVentilators(Integer availableVentilators) {
        this.availableVentilators = availableVentilators;
    }

    public String getEmergencyPhone() {
        return emergencyPhone;
    }

    public void setEmergencyPhone(String emergencyPhone) {
        this.emergencyPhone = emergencyPhone;
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

    public Boolean getHasTraumaCenter() {
        return hasTraumaCenter;
    }

    public void setHasTraumaCenter(Boolean hasTraumaCenter) {
        this.hasTraumaCenter = hasTraumaCenter;
    }

    public Boolean getHasBloodBank() {
        return hasBloodBank;
    }

    public void setHasBloodBank(Boolean hasBloodBank) {
        this.hasBloodBank = hasBloodBank;
    }

    public HospitalStatus getStatus() {
        return status;
    }

    public void setStatus(HospitalStatus status) {
        this.status = status;
    }
}
