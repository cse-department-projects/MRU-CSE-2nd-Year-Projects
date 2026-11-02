package com.resqnet.dto.hospital;

import com.resqnet.enums.HospitalStatus;
import java.time.LocalDateTime;

public class HospitalResponse {

    private Long id;
    private String name;
    private Integer totalBeds;
    private Integer availableGeneralBeds;
    private Integer availableIcuBeds;
    private Integer availableVentilators;
    private String emergencyPhone;
    private Double latitude;
    private Double longitude;
    private String address;
    private Boolean hasTraumaCenter;
    private Boolean hasBloodBank;
    private HospitalStatus status;
    private Double distanceKm;
    private LocalDateTime updatedAt;

    public HospitalResponse() {
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
