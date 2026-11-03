package com.hms.controller;

import com.hms.dto.response.ApiResponse;
import com.hms.dto.response.AppointmentResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.User;
import com.hms.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment booking and management")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    @Operation(summary = "Book a new appointment (Patient only)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @RequestBody @jakarta.validation.Valid com.hms.dto.request.BookAppointmentRequest request,
            @AuthenticationPrincipal User patient) {
        AppointmentResponse appointment = appointmentService.bookAppointment(request, patient);
        return ResponseEntity.status(201).body(ApiResponse.created(appointment, "Appointment booked successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all appointments (Admin) or filtered by role")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        PagedResponse<AppointmentResponse> appointments = appointmentService.getAllAppointments(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(appointments, "Appointments retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment, "Appointment retrieved successfully"));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get appointments for a specific patient")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getPatientAppointments(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<AppointmentResponse> appointments = appointmentService.getPatientAppointments(patientId, page, size);
        return ResponseEntity.ok(ApiResponse.success(appointments, "Patient appointments retrieved successfully"));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get appointments for a specific doctor")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        PagedResponse<AppointmentResponse> appointments = appointmentService.getDoctorAppointments(doctorId, page, size, status);
        return ResponseEntity.ok(ApiResponse.success(appointments, "Doctor appointments retrieved successfully"));
    }

    @PutMapping("/{id}/confirm")
    @Operation(summary = "Confirm a pending appointment (Doctor/Admin)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        AppointmentResponse appointment = appointmentService.confirmAppointment(id, user);
        return ResponseEntity.ok(ApiResponse.success(appointment, "Appointment confirmed successfully"));
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "Mark appointment as completed (Doctor/Admin)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String doctorNotes,
            @AuthenticationPrincipal User user) {
        AppointmentResponse appointment = appointmentService.completeAppointment(id, doctorNotes, user);
        return ResponseEntity.ok(ApiResponse.success(appointment, "Appointment completed successfully"));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        AppointmentResponse appointment = appointmentService.cancelAppointment(id, user);
        return ResponseEntity.ok(ApiResponse.success(appointment, "Appointment cancelled successfully"));
    }

    @GetMapping("/doctors/{doctorId}/slots")
    @Operation(summary = "Get available time slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<LocalTime>>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam String date) {
        LocalDate appointmentDate = LocalDate.parse(date);
        List<LocalTime> slots = appointmentService.getAvailableSlots(doctorId, appointmentDate);
        return ResponseEntity.ok(ApiResponse.success(slots, "Available slots retrieved successfully"));
    }
}
