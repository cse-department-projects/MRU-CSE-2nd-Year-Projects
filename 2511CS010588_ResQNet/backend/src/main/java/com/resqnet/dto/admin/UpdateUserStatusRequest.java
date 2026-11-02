package com.resqnet.dto.admin;

import jakarta.validation.constraints.NotNull;

public class UpdateUserStatusRequest {

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    public UpdateUserStatusRequest() {
    }

    public UpdateUserStatusRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
