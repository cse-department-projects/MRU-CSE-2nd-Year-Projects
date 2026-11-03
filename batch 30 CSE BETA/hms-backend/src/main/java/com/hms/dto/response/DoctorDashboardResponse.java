package com.hms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorDashboardResponse {
    private long todaysPatients;
    private long completedAppointments;
    private long pendingAppointments;
    private long totalPrescriptions;
    private List<AppointmentResponse> todaysAppointments;
    private List<AppointmentResponse> upcomingAppointments;
}
