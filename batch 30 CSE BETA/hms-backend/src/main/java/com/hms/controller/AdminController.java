package com.hms.controller;

import com.hms.dto.request.*;
import com.hms.dto.response.*;
import com.hms.entity.User;
import com.hms.service.*;
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
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {

    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AuditLogService auditLogService;

    // -------- Doctor Management --------

    @PostMapping("/doctors")
    @Operation(summary = "Create a new doctor account")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @Valid @RequestBody CreateDoctorRequest request,
            @AuthenticationPrincipal User admin) {
        DoctorResponse doctor = doctorService.createDoctor(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(doctor, "Doctor created successfully"));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get all doctors with pagination and search")
    public ResponseEntity<ApiResponse<PagedResponse<DoctorResponse>>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<DoctorResponse> doctors = doctorService.getAllDoctors(page, size, search);
        return ResponseEntity.ok(ApiResponse.success(doctors, "Doctors retrieved successfully"));
    }

    @GetMapping("/doctors/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable Long id) {
        DoctorResponse doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor, "Doctor retrieved successfully"));
    }

    @PutMapping("/doctors/{id}")
    @Operation(summary = "Update doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDoctorRequest request,
            @AuthenticationPrincipal User admin) {
        DoctorResponse doctor = doctorService.updateDoctor(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success(doctor, "Doctor updated successfully"));
    }

    @DeleteMapping("/doctors/{id}")
    @Operation(summary = "Deactivate a doctor account")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        doctorService.deleteDoctor(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Doctor deactivated successfully"));
    }

    // -------- Patient Management --------

    @GetMapping("/patients")
    @Operation(summary = "Get all patients with pagination and search")
    public ResponseEntity<ApiResponse<PagedResponse<PatientResponse>>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<PatientResponse> patients = patientService.getAllPatients(page, size, search);
        return ResponseEntity.ok(ApiResponse.success(patients, "Patients retrieved successfully"));
    }

    @GetMapping("/patients/{id}")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(@PathVariable Long id) {
        PatientResponse patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient retrieved successfully"));
    }

    @PutMapping("/patients/{id}")
    @Operation(summary = "Update patient profile")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientProfileRequest request,
            @AuthenticationPrincipal User admin) {
        // Get patient's userId first
        PatientResponse patient = patientService.getPatientById(id);
        PatientResponse updated = patientService.updatePatientProfile(patient.getUserId(), request, admin);
        return ResponseEntity.ok(ApiResponse.success(updated, "Patient updated successfully"));
    }

    @DeleteMapping("/patients/{id}")
    @Operation(summary = "Deactivate a patient account")
    public ResponseEntity<ApiResponse<Void>> deletePatient(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        patientService.deletePatient(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Patient deactivated successfully"));
    }

    // -------- Audit Logs --------

    @GetMapping("/audit-logs")
    @Operation(summary = "Get all audit logs")
    public ResponseEntity<ApiResponse<PagedResponse<com.hms.entity.AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var logs = auditLogService.getAllLogs(
                org.springframework.data.domain.PageRequest.of(page, size,
                        org.springframework.data.domain.Sort.by("createdAt").descending()));
        PagedResponse<com.hms.entity.AuditLog> pagedResponse = PagedResponse.<com.hms.entity.AuditLog>builder()
                .content(logs.getContent())
                .pageNumber(logs.getNumber())
                .pageSize(logs.getSize())
                .totalElements(logs.getTotalElements())
                .totalPages(logs.getTotalPages())
                .last(logs.isLast())
                .first(logs.isFirst())
                .build();
        return ResponseEntity.ok(ApiResponse.success(pagedResponse, "Audit logs retrieved successfully"));
    }
}
