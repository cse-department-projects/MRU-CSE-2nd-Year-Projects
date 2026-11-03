package com.hms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class CreatePrescriptionRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String notes;

    private String followUpInstructions;

    @NotEmpty(message = "At least one prescription item is required")
    private List<PrescriptionItemRequest> items;

    @Data
    public static class PrescriptionItemRequest {

        @NotNull(message = "Medicine ID is required")
        private Long medicineId;

        @NotBlank(message = "Dosage is required")
        private String dosage;

        @NotBlank(message = "Frequency is required")
        private String frequency;

        @NotBlank(message = "Duration is required")
        private String duration;

        private String instructions;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
