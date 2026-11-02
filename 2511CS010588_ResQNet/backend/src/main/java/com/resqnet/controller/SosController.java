package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import com.resqnet.dto.sos.AssignSosRequest;
import com.resqnet.dto.sos.RescueUnitSummaryResponse;
import com.resqnet.dto.sos.SosAlertResponse;
import com.resqnet.dto.sos.TriggerSosRequest;
import com.resqnet.dto.sos.UpdateSosStatusRequest;
import com.resqnet.service.SosService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sos")
public class SosController {

    private final SosService sosService;

    public SosController(SosService sosService) {
        this.sosService = sosService;
    }

    @PostMapping("/trigger")
    public ResponseEntity<ApiResponse<SosAlertResponse>> triggerSos(
            @Valid @RequestBody TriggerSosRequest request,
            Authentication authentication) {
        SosAlertResponse response = sosService.triggerSos(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "SOS EMERGENCY ALERT DISPATCHED"));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SosAlertResponse>>> getActiveSosQueue(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        List<SosAlertResponse> queue = sosService.getActiveSosQueue(lat, lon);
        return ResponseEntity.ok(ApiResponse.ok(queue, "Active SOS emergency queue retrieved"));
    }

    @GetMapping("/my-active")
    public ResponseEntity<ApiResponse<SosAlertResponse>> getMyActiveSos(Authentication authentication) {
        SosAlertResponse activeSos = sosService.getMyActiveSos(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(activeSos, "Current active SOS alert status"));
    }

    @GetMapping("/my-history")
    public ResponseEntity<ApiResponse<List<SosAlertResponse>>> getMySosHistory(Authentication authentication) {
        List<SosAlertResponse> history = sosService.getMySosHistory(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(history, "SOS alert history retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SosAlertResponse>> getSosById(@PathVariable Long id) {
        SosAlertResponse alert = sosService.getSosById(id);
        return ResponseEntity.ok(ApiResponse.ok(alert, "SOS alert details retrieved"));
    }

    @GetMapping("/rescue-units")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RescueUnitSummaryResponse>>> getRescueUnits() {
        List<RescueUnitSummaryResponse> units = sosService.getRescueUnits();
        return ResponseEntity.ok(ApiResponse.ok(units, "Active rescue unit roster retrieved"));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<SosAlertResponse>> assignSos(
            @PathVariable Long id,
            @Valid @RequestBody AssignSosRequest request) {
        SosAlertResponse updated = sosService.assignSos(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Rescue unit assigned to SOS alert"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<SosAlertResponse>> updateSosStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSosStatusRequest request) {
        SosAlertResponse updated = sosService.updateSosStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "SOS status updated successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SosAlertResponse>> cancelSos(
            @PathVariable Long id,
            Authentication authentication) {
        SosAlertResponse cancelled = sosService.cancelSos(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(cancelled, "SOS alert cancelled"));
    }
}
