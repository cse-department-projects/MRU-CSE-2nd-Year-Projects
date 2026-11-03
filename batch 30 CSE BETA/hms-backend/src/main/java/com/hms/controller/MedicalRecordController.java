package com.hms.controller;

import com.hms.dto.request.CreateMedicalRecordRequest;
import com.hms.dto.response.ApiResponse;
import com.hms.dto.response.MedicalRecordResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.User;
import com.hms.service.MedicalRecordService;
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
@RequestMapping("/medical-records")
@RequiredArgsConstructor
@Tag(name = "Medical Records", description = "Patient medical history management")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Create a medical record for an appointment")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> createMedicalRecord(
            @Valid @RequestBody CreateMedicalRecordRequest request,
            @AuthenticationPrincipal User doctor) {
        MedicalRecordResponse record = medicalRecordService.createMedicalRecord(request, doctor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(record, "Medical record created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get medical record by ID")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getMedicalRecordById(@PathVariable Long id) {
        MedicalRecordResponse record = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(ApiResponse.success(record, "Medical record retrieved successfully"));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get full medical history for a patient")
    public ResponseEntity<ApiResponse<PagedResponse<MedicalRecordResponse>>> getPatientMedicalHistory(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<MedicalRecordResponse> records = medicalRecordService.getPatientMedicalHistory(patientId, page, size);
        return ResponseEntity.ok(ApiResponse.success(records, "Medical history retrieved successfully"));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get all medical records created by a doctor")
    public ResponseEntity<ApiResponse<PagedResponse<MedicalRecordResponse>>> getDoctorMedicalRecords(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<MedicalRecordResponse> records = medicalRecordService.getDoctorMedicalRecords(doctorId, page, size);
        return ResponseEntity.ok(ApiResponse.success(records, "Medical records retrieved successfully"));
    }
}
