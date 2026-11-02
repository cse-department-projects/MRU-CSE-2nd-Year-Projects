package com.resqnet.dto.sos;

import com.resqnet.enums.SosStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateSosStatusRequest {

    @NotNull(message = "Status is required")
    private SosStatus status;

    public UpdateSosStatusRequest() {
    }

    public UpdateSosStatusRequest(SosStatus status) {
        this.status = status;
    }

    public SosStatus getStatus() {
        return status;
    }

    public void setStatus(SosStatus status) {
        this.status = status;
    }
}
