package com.resqnet.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resqnet.enums.OperationalStatus;
import com.resqnet.enums.TeamType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_team_profiles")
public class RescueTeamProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String unitName;

    @Column(length = 50)
    private String callSign;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TeamType teamType = TeamType.DISASTER_RESPONSE_FORCE;

    @Column(nullable = false)
    private Integer memberCount = 1;

    @Column(length = 100)
    private String vehicleType;

    @Column(columnDefinition = "TEXT")
    private String equipmentList;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OperationalStatus operationalStatus = OperationalStatus.STANDBY;

    private LocalDateTime updatedAt;

    public RescueTeamProfile() {
    }

    public RescueTeamProfile(User user) {
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

    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    public String getCallSign() {
        return callSign;
    }

    public void setCallSign(String callSign) {
        this.callSign = callSign;
    }

    public TeamType getTeamType() {
        return teamType;
    }

    public void setTeamType(TeamType teamType) {
        this.teamType = teamType;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getEquipmentList() {
        return equipmentList;
    }

    public void setEquipmentList(String equipmentList) {
        this.equipmentList = equipmentList;
    }

    public OperationalStatus getOperationalStatus() {
        return operationalStatus;
    }

    public void setOperationalStatus(OperationalStatus operationalStatus) {
        this.operationalStatus = operationalStatus;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
