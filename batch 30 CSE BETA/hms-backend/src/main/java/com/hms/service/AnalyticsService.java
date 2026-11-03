package com.hms.service;

import com.hms.dto.response.*;
import com.hms.entity.AppointmentStatus;
import com.hms.entity.User;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;

    private static final String[] DAY_NAMES = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};

    // ==================== Admin Analytics ====================

    public AdminAnalyticsResponse getAdminAnalytics() {
        LocalDate now = LocalDate.now();
        LocalDate oneYearAgo = now.minusYears(1).withDayOfMonth(1);
        LocalDateTime oneYearAgoDateTime = oneYearAgo.atStartOfDay();

        return AdminAnalyticsResponse.builder()
                .monthlyRevenue(getMonthlyRevenue(oneYearAgo, now))
                .revenueByDepartment(getRevenueByDepartment())
                .totalRevenue(billRepository.getTotalRevenue().orElse(BigDecimal.ZERO))
                .currentMonthRevenue(billRepository.getMonthlyRevenue(now.getYear(), now.getMonthValue()).orElse(BigDecimal.ZERO))
                .monthlyAppointments(getMonthlyAppointments(oneYearAgo, now))
                .appointmentStatusDistribution(getAppointmentStatusDistribution())
                .appointmentsByDayOfWeek(getAppointmentsByDayOfWeek(oneYearAgo, now))
                .genderDistribution(getGenderDistribution())
                .ageGroupDistribution(getAgeGroupDistribution())
                .bloodGroupDistribution(getBloodGroupDistribution())
                .monthlyPatientRegistrations(getMonthlyRegistrations(oneYearAgoDateTime, LocalDateTime.now()))
                .appointmentsByDepartment(getAppointmentsByDepartment())
                .paymentStatusDistribution(getPaymentStatusDistribution())
                .paymentMethodDistribution(getPaymentMethodDistribution())
                .topDoctorsByAppointments(getTopDoctors())
                .build();
    }

    // ==================== Doctor Analytics ====================

    public DoctorAnalyticsResponse getDoctorAnalytics(User doctorUser) {
        com.hms.entity.Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        Long doctorId = doctor.getId();
        LocalDate now = LocalDate.now();
        LocalDate oneYearAgo = now.minusYears(1).withDayOfMonth(1);

        long completed = appointmentRepository.countByDoctorIdAndStatus(doctorId, AppointmentStatus.COMPLETED);
        long total = appointmentRepository.findByDoctorId(doctorId,
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long completionRate = total > 0 ? (completed * 100) / total : 0;

        return DoctorAnalyticsResponse.builder()
                .monthlyAppointments(getMonthlyAppointmentsForDoctor(doctorId, oneYearAgo, now))
                .appointmentStatusDistribution(getAppointmentStatusForDoctor(doctorId))
                .appointmentsByDayOfWeek(getAppointmentsByDayOfWeekForDoctor(doctorId, oneYearAgo, now))
                .topPrescribedMedicines(getTopPrescribedByDoctor(doctorId))
                .topDiagnoses(getTopDiagnosesByDoctor(doctorId))
                .totalPatientsServed(appointmentRepository.countDistinctPatientsServedByDoctor(doctorId))
                .completionRate(completionRate)
                .build();
    }

    // ==================== Pharmacist Analytics ====================

    public PharmacistAnalyticsResponse getPharmacistAnalytics() {
        LocalDate today = LocalDate.now();

        return PharmacistAnalyticsResponse.builder()
                .categoryDistribution(getCategoryDistribution())
                .stockLevelsByCategory(getStockValueByCategory())
                .expiryForecast(getExpiryForecast(today))
                .totalInventoryValue(medicineRepository.getTotalInventoryValue())
                .topConsumedMedicines(getTopConsumedMedicines())
                .dosageFormDistribution(getDosageFormDistribution())
                .build();
    }

    // ==================== Patient Analytics ====================

    public PatientAnalyticsResponse getPatientAnalytics(User patientUser) {
        com.hms.entity.Patient patient = patientRepository.findByUserId(patientUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Long patientId = patient.getId();
        LocalDate now = LocalDate.now();
        LocalDate oneYearAgo = now.minusYears(1).withDayOfMonth(1);
        LocalDateTime oneYearAgoDateTime = oneYearAgo.atStartOfDay();

        return PatientAnalyticsResponse.builder()
                .monthlyVisits(getMonthlyVisitsForPatient(patientId, oneYearAgo, now))
                .visitStatusDistribution(getVisitStatusForPatient(patientId))
                .monthlySpending(getMonthlySpendingForPatient(patientId, oneYearAgoDateTime, LocalDateTime.now()))
                .totalSpent(billRepository.getTotalSpentByPatient(patientId).orElse(BigDecimal.ZERO))
                .topMedicinesPrescribed(getTopMedicinesForPatient(patientId))
                .build();
    }

    // ==================== Helper Methods ====================

    private List<ChartDataPoint> getMonthlyRevenue(LocalDate start, LocalDate end) {
        return billRepository.getMonthlyRevenueData(start, end).stream()
                .map(row -> ChartDataPoint.of(
                        formatMonthYear((Integer) row[0], (Integer) row[1]),
                        (BigDecimal) row[2]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getRevenueByDepartment() {
        return billRepository.getRevenueBySpecialization().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (BigDecimal) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getMonthlyAppointments(LocalDate start, LocalDate end) {
        return appointmentRepository.getMonthlyAppointmentCounts(start, end).stream()
                .map(row -> ChartDataPoint.of(
                        formatMonthYear((Integer) row[0], (Integer) row[1]),
                        (Long) row[2]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getAppointmentStatusDistribution() {
        return appointmentRepository.getAppointmentStatusDistribution().stream()
                .map(row -> ChartDataPoint.of(row[0].toString(), (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getAppointmentsByDayOfWeek(LocalDate start, LocalDate end) {
        return appointmentRepository.getAppointmentsByDayOfWeek(start, end).stream()
                .map(row -> {
                    int dayIndex = ((Number) row[0]).intValue();
                    return ChartDataPoint.of(DAY_NAMES[dayIndex - 1], (Long) row[1]);
                })
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getGenderDistribution() {
        return patientRepository.getGenderDistribution().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getAgeGroupDistribution() {
        return patientRepository.getAgeGroupDistribution().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getBloodGroupDistribution() {
        return patientRepository.getBloodGroupDistribution().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getMonthlyRegistrations(LocalDateTime start, LocalDateTime end) {
        return patientRepository.getMonthlyPatientRegistrations(start, end).stream()
                .map(row -> ChartDataPoint.of(
                        formatMonthYear((Integer) row[0], (Integer) row[1]),
                        (Long) row[2]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getAppointmentsByDepartment() {
        return appointmentRepository.getAppointmentsByDepartment().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getPaymentStatusDistribution() {
        return billRepository.getPaymentStatusDistribution().stream()
                .map(row -> ChartDataPoint.of(row[0].toString(), (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getPaymentMethodDistribution() {
        return billRepository.getPaymentMethodDistribution().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getTopDoctors() {
        return appointmentRepository.getTopDoctorsByCompletedAppointments().stream()
                .limit(10)
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    // Doctor-specific helpers
    private List<ChartDataPoint> getMonthlyAppointmentsForDoctor(Long doctorId, LocalDate start, LocalDate end) {
        return appointmentRepository.getMonthlyAppointmentCountsForDoctor(doctorId, start, end).stream()
                .map(row -> ChartDataPoint.of(
                        formatMonthYear((Integer) row[0], (Integer) row[1]),
                        (Long) row[2]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getAppointmentStatusForDoctor(Long doctorId) {
        return appointmentRepository.getAppointmentStatusDistributionForDoctor(doctorId).stream()
                .map(row -> ChartDataPoint.of(row[0].toString(), (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getAppointmentsByDayOfWeekForDoctor(Long doctorId, LocalDate start, LocalDate end) {
        return appointmentRepository.getAppointmentsByDayOfWeekForDoctor(doctorId, start, end).stream()
                .map(row -> {
                    int dayIndex = ((Number) row[0]).intValue();
                    return ChartDataPoint.of(DAY_NAMES[dayIndex - 1], (Long) row[1]);
                })
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getTopPrescribedByDoctor(Long doctorId) {
        return prescriptionItemRepository.getTopPrescribedMedicinesByDoctor(doctorId).stream()
                .limit(10)
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getTopDiagnosesByDoctor(Long doctorId) {
        return prescriptionItemRepository.getTopDiagnosesByDoctor(doctorId).stream()
                .limit(10)
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    // Pharmacist-specific helpers
    private List<ChartDataPoint> getCategoryDistribution() {
        return medicineRepository.getCategoryDistribution().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getStockValueByCategory() {
        return medicineRepository.getStockValueByCategory().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (BigDecimal) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getExpiryForecast(LocalDate today) {
        return medicineRepository.getExpiryForecast(today, today.plusDays(30), today.plusDays(60), today.plusDays(90)).stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getTopConsumedMedicines() {
        return prescriptionItemRepository.getTopConsumedMedicines().stream()
                .limit(10)
                .map(row -> ChartDataPoint.of((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getDosageFormDistribution() {
        return medicineRepository.getDosageFormDistribution().stream()
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    // Patient-specific helpers
    private List<ChartDataPoint> getMonthlyVisitsForPatient(Long patientId, LocalDate start, LocalDate end) {
        return appointmentRepository.getMonthlyAppointmentCountsForPatient(patientId, start, end).stream()
                .map(row -> ChartDataPoint.of(
                        formatMonthYear((Integer) row[0], (Integer) row[1]),
                        (Long) row[2]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getVisitStatusForPatient(Long patientId) {
        return appointmentRepository.getAppointmentStatusDistributionForPatient(patientId).stream()
                .map(row -> ChartDataPoint.of(row[0].toString(), (Long) row[1]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getMonthlySpendingForPatient(Long patientId, LocalDateTime start, LocalDateTime end) {
        return billRepository.getMonthlySpendingForPatient(patientId, start, end).stream()
                .map(row -> ChartDataPoint.of(
                        formatMonthYear((Integer) row[0], (Integer) row[1]),
                        (BigDecimal) row[2]))
                .collect(Collectors.toList());
    }

    private List<ChartDataPoint> getTopMedicinesForPatient(Long patientId) {
        return prescriptionItemRepository.getTopPrescribedMedicinesForPatient(patientId).stream()
                .limit(10)
                .map(row -> ChartDataPoint.of((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    // Utility
    private String formatMonthYear(int year, int month) {
        String monthName = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        return monthName + " " + year;
    }
}
