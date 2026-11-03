package com.citywatch.dto;

import com.citywatch.entity.*;
import jakarta.validation.constraints.*;

public final class ReportDtos {

    private ReportDtos() {}

    public record CreateReportRequest(
            @NotNull EmergencyType emergencyType,
            @NotBlank @Size(max = 255) String location,
            @NotBlank @Size(max = 3000) String description,
            Double latitude,
            Double longitude) {
    }

    public record StatusRequest(
            @NotNull ReportStatus status) {
    }

    public record ReportResponse(
            String reportCode,
            String emergencyType,
            String department,
            String description,
            String location,
            Double latitude,
            Double longitude,
            String status,
            String citizenName,
            String citizenCode,
            String createdAt,
            String updatedAt) {
    }
}