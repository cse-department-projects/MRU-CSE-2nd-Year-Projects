package com.hms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateMedicalRecordRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String diagnosis;

    private String treatment;

    private String symptoms;

    private String reports;

    private String doctorNotes;

    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;

    private String followUpRequired;
}
