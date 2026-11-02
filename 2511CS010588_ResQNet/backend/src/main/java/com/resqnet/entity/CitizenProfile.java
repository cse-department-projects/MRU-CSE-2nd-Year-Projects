package com.resqnet.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "citizen_profiles")
public class CitizenProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String medicalConditions;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String specialNeeds;

    private Boolean isElderlyOrChild = false;

    private LocalDateTime updatedAt;

    public CitizenProfile() {
    }

    public CitizenProfile(User user) {
        this.user = user;
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMedicalConditions() {
        return medicalConditions;
    }

    public void setMedicalConditions(String medicalConditions) {
        this.medicalConditions = medicalConditions;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getSpecialNeeds() {
        return specialNeeds;
    }

    public void setSpecialNeeds(String specialNeeds) {
        this.specialNeeds = specialNeeds;
    }

    public Boolean getIsElderlyOrChild() {
        return isElderlyOrChild;
    }

    public void setIsElderlyOrChild(Boolean elderlyOrChild) {
        isElderlyOrChild = elderlyOrChild;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
