package com.resqnet.dto.sos;

import jakarta.validation.constraints.NotNull;

public class AssignSosRequest {

    @NotNull(message = "Rescue Team User ID is required")
    private Long rescueTeamUserId;

    public AssignSosRequest() {
    }

    public AssignSosRequest(Long rescueTeamUserId) {
        this.rescueTeamUserId = rescueTeamUserId;
    }

    public Long getRescueTeamUserId() {
        return rescueTeamUserId;
    }

    public void setRescueTeamUserId(Long rescueTeamUserId) {
        this.rescueTeamUserId = rescueTeamUserId;
    }
}
