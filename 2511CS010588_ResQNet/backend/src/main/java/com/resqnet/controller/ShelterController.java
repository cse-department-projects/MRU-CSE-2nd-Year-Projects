package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import com.resqnet.dto.shelter.CreateShelterRequest;
import com.resqnet.dto.shelter.ShelterResponse;
import com.resqnet.dto.shelter.UpdateOccupancyRequest;
import com.resqnet.enums.ShelterStatus;
import com.resqnet.service.ShelterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shelters")
public class ShelterController {

    private final ShelterService shelterService;

    public ShelterController(ShelterService shelterService) {
        this.shelterService = shelterService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShelterResponse>>> getAllShelters(
            @RequestParam(required = false) ShelterStatus status) {
        List<ShelterResponse> shelters = shelterService.getAllShelters(status);
        return ResponseEntity.ok(ApiResponse.ok(shelters, "Shelters retrieved successfully"));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<ShelterResponse>>> getNearbyShelters(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(required = false, defaultValue = "25.0") Double radiusKm) {
        List<ShelterResponse> shelters = shelterService.getNearbyShelters(lat, lon, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(shelters, "Nearby shelters retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShelterResponse>> getShelterById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        ShelterResponse shelter = shelterService.getShelterById(id, lat, lon);
        return ResponseEntity.ok(ApiResponse.ok(shelter, "Shelter details retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<ShelterResponse>> createShelter(
            @Valid @RequestBody CreateShelterRequest request,
            Authentication authentication) {
        ShelterResponse created = shelterService.createShelter(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Shelter created successfully"));
    }

    @PatchMapping("/{id}/occupancy")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<ShelterResponse>> updateOccupancy(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOccupancyRequest request) {
        ShelterResponse updated = shelterService.updateOccupancy(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Shelter occupancy updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<ShelterResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam ShelterStatus status) {
        ShelterResponse updated = shelterService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Shelter status updated successfully"));
    }
}
