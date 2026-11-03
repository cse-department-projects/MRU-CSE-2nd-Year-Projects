package com.hms.controller;

import com.hms.dto.request.UpdatePatientProfileRequest;
import com.hms.dto.response.ApiResponse;
import com.hms.dto.response.PatientResponse;
import com.hms.entity.User;
import com.hms.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient profile management")
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/me")
    @Operation(summary = "Get current patient profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponse>> getMyProfile(@AuthenticationPrincipal User user) {
        PatientResponse patient = patientService.getPatientByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(patient, "Profile retrieved successfully"));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current patient profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponse>> updateMyProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdatePatientProfileRequest request) {
        PatientResponse patient = patientService.updatePatientProfile(user.getId(), request, user);
        return ResponseEntity.ok(ApiResponse.success(patient, "Profile updated successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID (Admin/Doctor)")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(@PathVariable Long id) {
        PatientResponse patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient retrieved successfully"));
    }
}
