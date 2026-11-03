package com.hms.controller;

import com.hms.dto.response.*;
import com.hms.entity.User;
import com.hms.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-specific dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard data")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Admin dashboard loaded successfully"));
    }

    @GetMapping("/pharmacist")
    @PreAuthorize("hasRole('PHARMACIST')")
    @Operation(summary = "Get pharmacist dashboard data")
    public ResponseEntity<ApiResponse<PharmacistDashboardResponse>> getPharmacistDashboard() {
        PharmacistDashboardResponse dashboard = dashboardService.getPharmacistDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Pharmacist dashboard loaded successfully"));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor dashboard data")
    public ResponseEntity<ApiResponse<DoctorDashboardResponse>> getDoctorDashboard(
            @AuthenticationPrincipal User user) {
        DoctorDashboardResponse dashboard = dashboardService.getDoctorDashboard(user);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Doctor dashboard loaded successfully"));
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient dashboard data")
    public ResponseEntity<ApiResponse<PatientDashboardResponse>> getPatientDashboard(
            @AuthenticationPrincipal User user) {
        PatientDashboardResponse dashboard = dashboardService.getPatientDashboard(user);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Patient dashboard loaded successfully"));
    }
}
