package com.hms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hms.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String doctorEmail;
    private String specialization;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private String reason;
    private String doctorNotes;
    private boolean billGenerated;
    private LocalDateTime createdAt;
}
