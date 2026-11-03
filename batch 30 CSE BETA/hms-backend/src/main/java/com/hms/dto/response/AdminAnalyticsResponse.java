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
public class AdminAnalyticsResponse {

    // Revenue analytics
    private List<ChartDataPoint> monthlyRevenue;
    private List<ChartDataPoint> revenueByDepartment;
    private BigDecimal totalRevenue;
    private BigDecimal currentMonthRevenue;

    // Appointment analytics
    private List<ChartDataPoint> monthlyAppointments;
    private List<ChartDataPoint> appointmentStatusDistribution;
    private List<ChartDataPoint> appointmentsByDayOfWeek;

    // Patient demographics
    private List<ChartDataPoint> genderDistribution;
    private List<ChartDataPoint> ageGroupDistribution;
    private List<ChartDataPoint> bloodGroupDistribution;
    private List<ChartDataPoint> monthlyPatientRegistrations;

    // Department performance
    private List<ChartDataPoint> appointmentsByDepartment;

    // Payment analytics
    private List<ChartDataPoint> paymentStatusDistribution;
    private List<ChartDataPoint> paymentMethodDistribution;

    // Top doctors by appointments
    private List<ChartDataPoint> topDoctorsByAppointments;
}
