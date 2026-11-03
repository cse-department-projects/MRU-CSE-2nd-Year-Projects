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
public class PharmacistAnalyticsResponse {

    // Stock analytics
    private List<ChartDataPoint> categoryDistribution;
    private List<ChartDataPoint> stockLevelsByCategory;
    private List<ChartDataPoint> expiryForecast;
    private BigDecimal totalInventoryValue;

    // Demand analytics
    private List<ChartDataPoint> topConsumedMedicines;
    private List<ChartDataPoint> dosageFormDistribution;
}
