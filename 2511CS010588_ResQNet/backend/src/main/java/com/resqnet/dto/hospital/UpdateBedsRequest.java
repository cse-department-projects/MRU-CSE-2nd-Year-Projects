package com.resqnet.dto.hospital;

import com.resqnet.enums.HospitalStatus;
import jakarta.validation.constraints.Min;

public class UpdateBedsRequest {

    @Min(value = 0, message = "Available general beds cannot be negative")
    private Integer availableGeneralBeds;

    @Min(value = 0, message = "Available ICU beds cannot be negative")
    private Integer availableIcuBeds;

    @Min(value = 0, message = "Available ventilators cannot be negative")
    private Integer availableVentilators;

    private HospitalStatus status;

    public UpdateBedsRequest() {
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

    public HospitalStatus getStatus() {
        return status;
    }

    public void setStatus(HospitalStatus status) {
        this.status = status;
    }
}
