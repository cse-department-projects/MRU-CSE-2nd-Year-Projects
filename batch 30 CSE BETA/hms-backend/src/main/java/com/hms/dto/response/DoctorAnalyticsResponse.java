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
public class DoctorAnalyticsResponse {

    // Appointment trends
    private List<ChartDataPoint> monthlyAppointments;
    private List<ChartDataPoint> appointmentStatusDistribution;
    private List<ChartDataPoint> appointmentsByDayOfWeek;

    // Prescribing patterns
    private List<ChartDataPoint> topPrescribedMedicines;
    private List<ChartDataPoint> topDiagnoses;

    // Performance metrics
    private long totalPatientsServed;
    private long completionRate;
}
