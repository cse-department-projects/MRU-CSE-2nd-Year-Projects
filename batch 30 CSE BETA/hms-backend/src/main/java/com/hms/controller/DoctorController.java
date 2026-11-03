package com.hms.controller;

import com.hms.dto.request.UpdateDoctorRequest;
import com.hms.dto.response.ApiResponse;
import com.hms.dto.response.DoctorResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.User;
import com.hms.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor profile and availability endpoints")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/me")
    @Operation(summary = "Get current doctor profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMyProfile(@AuthenticationPrincipal User user) {
        DoctorResponse doctor = doctorService.getDoctorByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(doctor, "Profile retrieved successfully"));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current doctor profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateMyProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateDoctorRequest request) {
        DoctorResponse doctor = doctorService.getDoctorByUserId(user.getId());
        DoctorResponse updated = doctorService.updateDoctor(doctor.getId(), request, user);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @GetMapping("/available")
    @Operation(summary = "Get all available doctors (public endpoint)")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAvailableDoctors() {
        List<DoctorResponse> doctors = doctorService.getAvailableDoctors();
        return ResponseEntity.ok(ApiResponse.success(doctors, "Available doctors retrieved successfully"));
    }

    @GetMapping("/specializations")
    @Operation(summary = "Get all doctor specializations")
    public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
        List<String> specializations = doctorService.getAllSpecializations();
        return ResponseEntity.ok(ApiResponse.success(specializations, "Specializations retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable Long id) {
        DoctorResponse doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor, "Doctor retrieved successfully"));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get doctor by User ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorByUserId(@PathVariable Long userId) {
        DoctorResponse doctor = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(doctor, "Doctor retrieved successfully"));
    }
}
