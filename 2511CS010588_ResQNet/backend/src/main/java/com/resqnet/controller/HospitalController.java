package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import com.resqnet.dto.hospital.CreateHospitalRequest;
import com.resqnet.dto.hospital.HospitalResponse;
import com.resqnet.dto.hospital.UpdateBedsRequest;
import com.resqnet.enums.HospitalStatus;
import com.resqnet.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getAllHospitals(
            @RequestParam(required = false) HospitalStatus status) {
        List<HospitalResponse> hospitals = hospitalService.getAllHospitals(status);
        return ResponseEntity.ok(ApiResponse.ok(hospitals, "Hospitals retrieved successfully"));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getNearbyHospitals(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(required = false, defaultValue = "25.0") Double radiusKm) {
        List<HospitalResponse> hospitals = hospitalService.getNearbyHospitals(lat, lon, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(hospitals, "Nearby hospitals retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalResponse>> getHospitalById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        HospitalResponse hospital = hospitalService.getHospitalById(id, lat, lon);
        return ResponseEntity.ok(ApiResponse.ok(hospital, "Hospital details retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(
            @Valid @RequestBody CreateHospitalRequest request) {
        HospitalResponse created = hospitalService.createHospital(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Hospital registered successfully"));
    }

    @PatchMapping("/{id}/beds")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateBeds(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBedsRequest request) {
        HospitalResponse updated = hospitalService.updateBeds(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Hospital bed availability updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam HospitalStatus status) {
        HospitalResponse updated = hospitalService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Hospital status updated successfully"));
    }
}
