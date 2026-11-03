package com.hms.service;

import com.hms.dto.request.BookAppointmentRequest;
import com.hms.dto.response.AppointmentResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.*;
import com.hms.exception.AppointmentConflictException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.exception.UnauthorizedException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    public AppointmentResponse bookAppointment(BookAppointmentRequest request, User patientUser) {
        Patient patient = patientRepository.findByUserId(patientUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        if (!doctor.isAvailable()) {
            throw new IllegalArgumentException("Doctor is not available for appointments");
        }

        // Conflict detection
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                doctor.getId(), request.getAppointmentDate(), request.getAppointmentTime());
        if (!conflicts.isEmpty()) {
            throw new AppointmentConflictException(
                    "This time slot is already booked. Please choose a different time.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .reason(request.getReason())
                .build();

        appointment = appointmentRepository.save(appointment);
        auditLogService.log(patientUser, "BOOK_APPOINTMENT", "APPOINTMENT", appointment.getId(),
                "Appointment booked with Dr. " + doctor.getUser().getFullName());
        // Extract data while still in transaction before async call
        emailService.sendAppointmentBookedEmailToDoctor(
                doctor.getUser().getEmail(),
                doctor.getUser().getLastName(),
                patient.getUser().getFullName(),
                appointment.getAppointmentDate().toString(),
                appointment.getAppointmentTime().toString(),
                appointment.getReason());
        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getAllAppointments(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());
        Page<Appointment> appointments;

        if (status != null && !status.isBlank()) {
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            appointments = appointmentRepository.findByStatus(appointmentStatus, pageable);
        } else {
            appointments = appointmentRepository.findAll(pageable);
        }

        return toPagedResponse(appointments);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getPatientAppointments(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());
        Page<Appointment> appointments = appointmentRepository.findByPatientId(patientId, pageable);
        return toPagedResponse(appointments);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AppointmentResponse> getDoctorAppointments(Long doctorId, int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());
        Page<Appointment> appointments;

        if (status != null && !status.isBlank()) {
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            appointments = appointmentRepository.findByDoctorIdAndStatus(doctorId, appointmentStatus, pageable);
        } else {
            appointments = appointmentRepository.findByDoctorId(doctorId, pageable);
        }

        return toPagedResponse(appointments);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return mapToResponse(appointment);
    }

    public AppointmentResponse confirmAppointment(Long id, User confirmedBy) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        auditLogService.log(confirmedBy, "CONFIRM_APPOINTMENT", "APPOINTMENT", id,
                "Appointment confirmed for patient: " + appointment.getPatient().getUser().getFullName());
        // Extract data while still in transaction before async call
        emailService.sendAppointmentStatusEmailToPatient(
                appointment.getPatient().getUser().getEmail(),
                appointment.getPatient().getUser().getFirstName(),
                appointment.getDoctor().getUser().getFullName(),
                appointment.getAppointmentDate().toString(),
                appointment.getAppointmentTime().toString(),
                "CONFIRMED");
        return mapToResponse(appointment);
    }

    public AppointmentResponse completeAppointment(Long id, String doctorNotes, User completedBy) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED &&
            appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalArgumentException("Appointment cannot be completed in its current status");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        if (doctorNotes != null) appointment.setDoctorNotes(doctorNotes);
        appointment = appointmentRepository.save(appointment);
        auditLogService.log(completedBy, "COMPLETE_APPOINTMENT", "APPOINTMENT", id,
                "Appointment completed for patient: " + appointment.getPatient().getUser().getFullName());
        return mapToResponse(appointment);
    }

    public AppointmentResponse cancelAppointment(Long id, User cancelledBy) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed appointments cannot be cancelled");
        }

        // Patients can only cancel their own appointments
        if (cancelledBy.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(cancelledBy.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
            if (!appointment.getPatient().getId().equals(patient.getId())) {
                throw new UnauthorizedException("You can only cancel your own appointments");
            }
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        auditLogService.log(cancelledBy, "CANCEL_APPOINTMENT", "APPOINTMENT", id,
                "Appointment cancelled by: " + cancelledBy.getFullName());
        // Extract data while still in transaction before async call
        emailService.sendAppointmentStatusEmailToPatient(
                appointment.getPatient().getUser().getEmail(),
                appointment.getPatient().getUser().getFirstName(),
                appointment.getDoctor().getUser().getFullName(),
                appointment.getAppointmentDate().toString(),
                appointment.getAppointmentTime().toString(),
                "CANCELLED");
        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<LocalTime> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        List<Appointment> bookedAppointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
        List<LocalTime> bookedTimes = bookedAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED && a.getStatus() != AppointmentStatus.NO_SHOW)
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toList());

        // Generate slots every 30 minutes within doctor's available time range
        List<LocalTime> allSlots = new java.util.ArrayList<>();
        LocalTime start = doctor.getAvailableTimeStart() != null ? doctor.getAvailableTimeStart() : LocalTime.of(9, 0);
        LocalTime end = doctor.getAvailableTimeEnd() != null ? doctor.getAvailableTimeEnd() : LocalTime.of(17, 0);

        LocalTime current = start;
        while (current.isBefore(end)) {
            if (!bookedTimes.contains(current)) {
                allSlots.add(current);
            }
            current = current.plusMinutes(30);
        }

        return allSlots;
    }

    public AppointmentResponse mapToResponse(Appointment appointment) {
        User doctorUser = appointment.getDoctor().getUser();
        User patientUser = appointment.getPatient().getUser();
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(patientUser.getFullName())
                .patientEmail(patientUser.getEmail())
                .patientPhone(patientUser.getPhone())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(doctorUser.getFullName())
                .doctorEmail(doctorUser.getEmail())
                .specialization(appointment.getDoctor().getSpecialization())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .doctorNotes(appointment.getDoctorNotes())
                .billGenerated(appointment.isBillGenerated())
                .createdAt(appointment.getCreatedAt())
                .build();
    }

    private PagedResponse<AppointmentResponse> toPagedResponse(Page<Appointment> page) {
        List<AppointmentResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PagedResponse.<AppointmentResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
