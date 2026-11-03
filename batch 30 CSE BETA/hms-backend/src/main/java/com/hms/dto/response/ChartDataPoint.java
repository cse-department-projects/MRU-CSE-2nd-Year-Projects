package com.hms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataPoint {
    private String label;
    private Long count;
    private BigDecimal value;

    public static ChartDataPoint of(String label, Long count) {
        return ChartDataPoint.builder().label(label).count(count).build();
    }

    public static ChartDataPoint of(String label, BigDecimal value) {
        return ChartDataPoint.builder().label(label).value(value).build();
    }

    public static ChartDataPoint of(String label, Long count, BigDecimal value) {
        return ChartDataPoint.builder().label(label).count(count).value(value).build();
    }
}
