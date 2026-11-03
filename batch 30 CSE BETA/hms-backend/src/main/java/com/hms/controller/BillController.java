package com.hms.controller;

import com.hms.dto.request.GenerateBillRequest;
import com.hms.dto.response.ApiResponse;
import com.hms.dto.response.BillResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.User;
import com.hms.service.BillService;
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
@RequestMapping("/bills")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Bill generation and payment management")
public class BillController {

    private final BillService billService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Generate a bill for a completed appointment")
    public ResponseEntity<ApiResponse<BillResponse>> generateBill(
            @Valid @RequestBody GenerateBillRequest request,
            @AuthenticationPrincipal User user) {
        BillResponse bill = billService.generateBill(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(bill, "Bill generated successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bills with optional payment status filter (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<BillResponse>>> getAllBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String paymentStatus) {
        PagedResponse<BillResponse> bills = billService.getAllBills(page, size, paymentStatus);
        return ResponseEntity.ok(ApiResponse.success(bills, "Bills retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bill by ID")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@PathVariable Long id) {
        BillResponse bill = billService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.success(bill, "Bill retrieved successfully"));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get bill by appointment ID")
    public ResponseEntity<ApiResponse<BillResponse>> getBillByAppointmentId(@PathVariable Long appointmentId) {
        BillResponse bill = billService.getBillByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(bill, "Bill retrieved successfully"));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get all bills for a patient")
    public ResponseEntity<ApiResponse<PagedResponse<BillResponse>>> getPatientBills(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<BillResponse> bills = billService.getPatientBills(patientId, page, size);
        return ResponseEntity.ok(ApiResponse.success(bills, "Patient bills retrieved successfully"));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Mark a bill as paid (Admin/Doctor)")
    public ResponseEntity<ApiResponse<BillResponse>> markAsPaid(
            @PathVariable Long id,
            @RequestParam(required = false) String paymentMethod,
            @AuthenticationPrincipal User user) {
        BillResponse bill = billService.markAsPaid(id, paymentMethod, user);
        return ResponseEntity.ok(ApiResponse.success(bill, "Bill marked as paid successfully"));
    }
}
