package com.resqnet.entity;

import com.resqnet.enums.HospitalStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer totalBeds = 100;

    @Column(nullable = false)
    private Integer availableGeneralBeds = 50;

    @Column(nullable = false)
    private Integer availableIcuBeds = 10;

    @Column(nullable = false)
    private Integer availableVentilators = 5;

    @Column(nullable = false, length = 30)
    private String emergencyPhone;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false, length = 255)
    private String address;

    private Boolean hasTraumaCenter = true;

    private Boolean hasBloodBank = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HospitalStatus status = HospitalStatus.OPERATIONAL;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Hospital() {
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

    // Getters and Setters
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
