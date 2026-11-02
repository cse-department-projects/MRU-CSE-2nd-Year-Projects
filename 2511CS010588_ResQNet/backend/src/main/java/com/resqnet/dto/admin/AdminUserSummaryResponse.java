package com.resqnet.dto.admin;

import com.resqnet.enums.BloodGroup;
import com.resqnet.enums.Role;
import java.time.LocalDateTime;

public class AdminUserSummaryResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private BloodGroup bloodGroup;
    private Boolean isActive;
    private String address;
    private LocalDateTime createdAt;

    // Optional profile summaries
    private Integer volunteerPoints;
    private String volunteerTier;
    private Boolean volunteerVerified;
    private String rescueUnitName;
    private String rescueTeamType;

    public AdminUserSummaryResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getVolunteerPoints() {
        return volunteerPoints;
    }

    public void setVolunteerPoints(Integer volunteerPoints) {
        this.volunteerPoints = volunteerPoints;
    }

    public String getVolunteerTier() {
        return volunteerTier;
    }

    public void setVolunteerTier(String volunteerTier) {
        this.volunteerTier = volunteerTier;
    }

    public Boolean getVolunteerVerified() {
        return volunteerVerified;
    }

    public void setVolunteerVerified(Boolean volunteerVerified) {
        this.volunteerVerified = volunteerVerified;
    }

    public String getRescueUnitName() {
        return rescueUnitName;
    }

    public void setRescueUnitName(String rescueUnitName) {
        this.rescueUnitName = rescueUnitName;
    }

    public String getRescueTeamType() {
        return rescueTeamType;
    }

    public void setRescueTeamType(String rescueTeamType) {
        this.rescueTeamType = rescueTeamType;
    }
}
