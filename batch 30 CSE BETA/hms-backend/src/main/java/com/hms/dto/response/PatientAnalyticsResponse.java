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
public class PatientAnalyticsResponse {

    // Visit history
    private List<ChartDataPoint> monthlyVisits;
    private List<ChartDataPoint> visitStatusDistribution;

    // Spending history
    private List<ChartDataPoint> monthlySpending;
    private BigDecimal totalSpent;

    // Prescriptions
    private List<ChartDataPoint> topMedicinesPrescribed;
}
