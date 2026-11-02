package com.resqnet.dto.shelter;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateOccupancyRequest {

    @NotNull(message = "Current occupancy is required")
    @Min(value = 0, message = "Occupancy cannot be negative")
    private Integer currentOccupancy;

    public UpdateOccupancyRequest() {
    }

    public UpdateOccupancyRequest(Integer currentOccupancy) {
        this.currentOccupancy = currentOccupancy;
    }

    public Integer getCurrentOccupancy() {
        return currentOccupancy;
    }

    public void setCurrentOccupancy(Integer currentOccupancy) {
        this.currentOccupancy = currentOccupancy;
    }
}
