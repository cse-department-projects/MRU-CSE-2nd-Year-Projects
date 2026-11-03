package com.hms.service;

import com.hms.dto.response.*;
import com.hms.entity.AppointmentStatus;
import com.hms.entity.User;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicineRepository medicineRepository;
    private final BillRepository billRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentService appointmentService;
    private final BillService billService;
    private final PrescriptionService prescriptionService;
    private final MedicineService medicineService;

    public PharmacistDashboardResponse getPharmacistDashboard() {
        LocalDate today = LocalDate.now();
        long totalMedicines = medicineRepository.countByIsActiveTrue();
        long lowStockMedicines = medicineRepository.countLowStockMedicines();
        long expiringMedicines = medicineRepository.findExpiringMedicines(today, today.plusDays(30)).size();

        List<MedicineResponse> recentLowStockMedicines = medicineRepository.findLowStockMedicines().stream()
                .limit(5)
                .map(medicineService::mapToResponse)
                .collect(Collectors.toList());

        return PharmacistDashboardResponse.builder()
                .totalMedicines(totalMedicines)
                .lowStockMedicines(lowStockMedicines)
                .expiringMedicines(expiringMedicines)
                .recentLowStockMedicines(recentLowStockMedicines)
                .build();
    }

    public AdminDashboardResponse getAdminDashboard() {
        LocalDate today = LocalDate.now();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long todaysAppointments = appointmentRepository.countTodaysAppointments(today);
        long totalMedicines = medicineRepository.countByIsActiveTrue();
        long lowStockMedicines = medicineRepository.countLowStockMedicines();
        long pendingBills = billRepository.countPendingBills();
        BigDecimal totalRevenue = billRepository.getTotalRevenue().orElse(BigDecimal.ZERO);
        BigDecimal monthlyRevenue = billRepository.getMonthlyRevenue(
                today.getYear(), today.getMonthValue()).orElse(BigDecimal.ZERO);

        long pendingAppointments = appointmentRepository.findByStatus(
                AppointmentStatus.PENDING, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long totalAppointments = appointmentRepository.countAllAppointments();

        List<AppointmentResponse> recentAppointments = appointmentRepository
                .findTodaysAppointments(today).stream()
                .limit(5)
                .map(appointmentService::mapToResponse)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .todaysAppointments(todaysAppointments)
                .totalAppointments(totalAppointments)
                .pendingAppointments(pendingAppointments)
                .totalMedicines(totalMedicines)
                .lowStockMedicines(lowStockMedicines)
                .pendingBills(pendingBills)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .recentAppointments(recentAppointments)
                .build();
    }

    public DoctorDashboardResponse getDoctorDashboard(User doctorUser) {
        com.hms.entity.Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new com.hms.exception.ResourceNotFoundException("Doctor profile not found"));

        LocalDate today = LocalDate.now();
        long todaysPatients = appointmentRepository.countTodaysAppointmentsForDoctor(doctor.getId(), today);
        long completedAppointments = appointmentRepository.countByDoctorIdAndStatus(doctor.getId(), AppointmentStatus.COMPLETED);
        long pendingAppointments = appointmentRepository.countByDoctorIdAndStatus(doctor.getId(), AppointmentStatus.PENDING);
        long totalPrescriptions = prescriptionRepository.countByDoctorId(doctor.getId());

        List<AppointmentResponse> todaysAppointments = appointmentRepository
                .findTodaysAppointmentsForDoctor(doctor.getId(), today).stream()
                .map(appointmentService::mapToResponse)
                .collect(Collectors.toList());

        List<AppointmentResponse> upcomingAppointments = appointmentRepository
                .findUpcomingAppointmentsForDoctor(doctor.getId(), today.plusDays(1)).stream()
                .limit(10)
                .map(appointmentService::mapToResponse)
                .collect(Collectors.toList());

        return DoctorDashboardResponse.builder()
                .todaysPatients(todaysPatients)
                .completedAppointments(completedAppointments)
                .pendingAppointments(pendingAppointments)
                .totalPrescriptions(totalPrescriptions)
                .todaysAppointments(todaysAppointments)
                .upcomingAppointments(upcomingAppointments)
                .build();
    }

    public PatientDashboardResponse getPatientDashboard(User patientUser) {
        com.hms.entity.Patient patient = patientRepository.findByUserId(patientUser.getId())
                .orElseThrow(() -> new com.hms.exception.ResourceNotFoundException("Patient profile not found"));

        LocalDate today = LocalDate.now();
        long totalAppointments = appointmentRepository.countByPatientId(patient.getId());
        long upcomingAppointments = appointmentRepository.findUpcomingForPatient(patient.getId(), today).size();
        long pendingBills = billRepository.findByPatientId(patient.getId(),
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long totalPrescriptions = prescriptionRepository.findAllByPatientIdOrderByCreatedAtDesc(patient.getId()).size();

        List<AppointmentResponse> recentAppointments = appointmentRepository
                .findUpcomingForPatient(patient.getId(), today).stream()
                .limit(5)
                .map(appointmentService::mapToResponse)
                .collect(Collectors.toList());

        List<BillResponse> recentBills = billRepository
                .findByPatientId(patient.getId(), org.springframework.data.domain.PageRequest.of(0, 5))
                .getContent().stream()
                .map(billService::mapToResponse)
                .collect(Collectors.toList());

        List<PrescriptionResponse> recentPrescriptions = prescriptionRepository
                .findAllByPatientIdOrderByCreatedAtDesc(patient.getId()).stream()
                .limit(3)
                .map(prescriptionService::mapToResponse)
                .collect(Collectors.toList());

        return PatientDashboardResponse.builder()
                .totalAppointments(totalAppointments)
                .upcomingAppointments(upcomingAppointments)
                .pendingBills(pendingBills)
                .totalPrescriptions(totalPrescriptions)
                .recentAppointments(recentAppointments)
                .recentBills(recentBills)
                .recentPrescriptions(recentPrescriptions)
                .build();
    }
}
