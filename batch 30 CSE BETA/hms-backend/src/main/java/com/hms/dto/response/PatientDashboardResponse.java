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
public class PatientDashboardResponse {
    private long totalAppointments;
    private long upcomingAppointments;
    private long pendingBills;
    private long totalPrescriptions;
    private List<AppointmentResponse> recentAppointments;
    private List<BillResponse> recentBills;
    private List<PrescriptionResponse> recentPrescriptions;
}
