package com.hms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminDashboardResponse {
    private long totalPatients;
    private long totalDoctors;
    private long todaysAppointments;
    private long totalAppointments;
    private long pendingAppointments;
    private long totalMedicines;
    private long lowStockMedicines;
    private long pendingBills;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private List<AppointmentResponse> recentAppointments;
    private List<String> recentActivities;
}
