package com.resqnet.dto.disaster;

import com.resqnet.enums.DisasterStatus;
import com.resqnet.enums.Severity;
import jakarta.validation.constraints.NotNull;

public class VerifyDisasterRequest {

    @NotNull(message = "Status is required")
    private DisasterStatus status;

    private Severity updatedSeverity;

    public VerifyDisasterRequest() {
    }

    public DisasterStatus getStatus() {
        return status;
    }

    public void setStatus(DisasterStatus status) {
        this.status = status;
    }

    public Severity getUpdatedSeverity() {
        return updatedSeverity;
    }

    public void setUpdatedSeverity(Severity updatedSeverity) {
        this.updatedSeverity = updatedSeverity;
    }
}
