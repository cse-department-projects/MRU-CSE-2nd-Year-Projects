package com.resqnet.entity;

import com.resqnet.enums.BloodGroup;
import com.resqnet.enums.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BloodGroup bloodGroup = BloodGroup.UNKNOWN;

    @Column(length = 100)
    private String emergencyContactName;

    @Column(length = 20)
    private String emergencyContactPhone;

    private Double currentLatitude;

    private Double currentLongitude;

    @Column(length = 255)
    private String address;

    @Column(nullable = false)
    private Boolean isActive = true;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CitizenProfile citizenProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private VolunteerProfile volunteerProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RescueTeamProfile rescueTeamProfile;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public User() {
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public CitizenProfile getCitizenProfile() {
        return citizenProfile;
    }

    public void setCitizenProfile(CitizenProfile citizenProfile) {
        this.citizenProfile = citizenProfile;
        if (citizenProfile != null) {
            citizenProfile.setUser(this);
        }
    }

    public VolunteerProfile getVolunteerProfile() {
        return volunteerProfile;
    }

    public void setVolunteerProfile(VolunteerProfile volunteerProfile) {
        this.volunteerProfile = volunteerProfile;
        if (volunteerProfile != null) {
            volunteerProfile.setUser(this);
        }
    }

    public RescueTeamProfile getRescueTeamProfile() {
        return rescueTeamProfile;
    }

    public void setRescueTeamProfile(RescueTeamProfile rescueTeamProfile) {
        this.rescueTeamProfile = rescueTeamProfile;
        if (rescueTeamProfile != null) {
            rescueTeamProfile.setUser(this);
        }
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
