package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import com.resqnet.dto.disaster.CreateDisasterReportRequest;
import com.resqnet.dto.disaster.DisasterReportResponse;
import com.resqnet.dto.disaster.VerifyDisasterRequest;
import com.resqnet.enums.DisasterStatus;
import com.resqnet.enums.DisasterType;
import com.resqnet.enums.Severity;
import com.resqnet.service.DisasterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disasters")
public class DisasterController {

    private final DisasterService disasterService;

    public DisasterController(DisasterService disasterService) {
        this.disasterService = disasterService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DisasterReportResponse>> createReport(
            @Valid @RequestBody CreateDisasterReportRequest request,
            Authentication authentication) {
        DisasterReportResponse response = disasterService.createReport(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Disaster report submitted successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DisasterReportResponse>>> getAllReports(
            @RequestParam(required = false) DisasterType type,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) DisasterStatus status) {
        List<DisasterReportResponse> reports = disasterService.getAllReports(type, severity, status);
        return ResponseEntity.ok(ApiResponse.ok(reports, "Disaster reports retrieved successfully"));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<DisasterReportResponse>>> getNearbyReports(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(required = false, defaultValue = "25.0") Double radiusKm) {
        List<DisasterReportResponse> reports = disasterService.getNearbyReports(lat, lon, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(reports, "Nearby disaster reports retrieved successfully"));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<List<DisasterReportResponse>>> getMyReports(Authentication authentication) {
        List<DisasterReportResponse> reports = disasterService.getMyReports(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(reports, "Your disaster reports retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DisasterReportResponse>> getReportById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        DisasterReportResponse report = disasterService.getReportById(id, lat, lon);
        return ResponseEntity.ok(ApiResponse.ok(report, "Disaster report retrieved successfully"));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<DisasterReportResponse>> verifyReport(
            @PathVariable Long id,
            @Valid @RequestBody VerifyDisasterRequest request,
            Authentication authentication) {
        DisasterReportResponse report = disasterService.verifyReport(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(report, "Disaster report verification updated"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<DisasterReportResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam DisasterStatus status) {
        DisasterReportResponse report = disasterService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(report, "Disaster report status updated"));
    }
}
