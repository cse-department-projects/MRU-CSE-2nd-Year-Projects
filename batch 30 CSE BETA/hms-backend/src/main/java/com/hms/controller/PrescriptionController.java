package com.hms.controller;

import com.hms.dto.request.CreatePrescriptionRequest;
import com.hms.dto.response.ApiResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.dto.response.PrescriptionResponse;
import com.hms.entity.User;
import com.hms.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Medical prescription management")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Create a new prescription for an appointment")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequest request,
            @AuthenticationPrincipal User doctor) {
        PrescriptionResponse prescription = prescriptionService.createPrescription(request, doctor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(prescription, "Prescription created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get prescription by ID")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionById(@PathVariable Long id) {
        PrescriptionResponse prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(prescription, "Prescription retrieved successfully"));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get prescription by appointment ID")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionByAppointment(@PathVariable Long appointmentId) {
        PrescriptionResponse prescription = prescriptionService.getPrescriptionByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(prescription, "Prescription retrieved successfully"));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get all prescriptions for a patient")
    public ResponseEntity<ApiResponse<PagedResponse<PrescriptionResponse>>> getPatientPrescriptions(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PrescriptionResponse> prescriptions = prescriptionService.getPatientPrescriptions(patientId, page, size);
        return ResponseEntity.ok(ApiResponse.success(prescriptions, "Prescriptions retrieved successfully"));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get all prescriptions by a doctor")
    public ResponseEntity<ApiResponse<PagedResponse<PrescriptionResponse>>> getDoctorPrescriptions(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PrescriptionResponse> prescriptions = prescriptionService.getDoctorPrescriptions(doctorId, page, size);
        return ResponseEntity.ok(ApiResponse.success(prescriptions, "Prescriptions retrieved successfully"));
    }
}
