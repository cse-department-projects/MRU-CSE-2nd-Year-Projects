package com.hms.controller;

import com.hms.dto.response.*;
import com.hms.entity.User;
import com.hms.service.AnalyticsService;
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
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Data analytics endpoints for all roles")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin analytics - revenue trends, appointment stats, demographics")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAdminAnalytics() {
        AdminAnalyticsResponse analytics = analyticsService.getAdminAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics, "Admin analytics loaded successfully"));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor analytics - personal performance, prescribing patterns")
    public ResponseEntity<ApiResponse<DoctorAnalyticsResponse>> getDoctorAnalytics(
            @AuthenticationPrincipal User user) {
        DoctorAnalyticsResponse analytics = analyticsService.getDoctorAnalytics(user);
        return ResponseEntity.ok(ApiResponse.success(analytics, "Doctor analytics loaded successfully"));
    }

    @GetMapping("/pharmacist")
    @PreAuthorize("hasRole('PHARMACIST')")
    @Operation(summary = "Get pharmacist analytics - stock levels, expiry forecast, demand")
    public ResponseEntity<ApiResponse<PharmacistAnalyticsResponse>> getPharmacistAnalytics() {
        PharmacistAnalyticsResponse analytics = analyticsService.getPharmacistAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics, "Pharmacist analytics loaded successfully"));
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient analytics - visit history, spending trends")
    public ResponseEntity<ApiResponse<PatientAnalyticsResponse>> getPatientAnalytics(
            @AuthenticationPrincipal User user) {
        PatientAnalyticsResponse analytics = analyticsService.getPatientAnalytics(user);
        return ResponseEntity.ok(ApiResponse.success(analytics, "Patient analytics loaded successfully"));
    }
}
