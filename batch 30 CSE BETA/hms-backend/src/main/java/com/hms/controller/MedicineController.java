package com.hms.controller;

import com.hms.dto.request.MedicineRequest;
import com.hms.dto.response.ApiResponse;
import com.hms.dto.response.MedicineResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.User;
import com.hms.service.MedicineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
@Tag(name = "Medicines", description = "Pharmacy and medicine inventory management")
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @Operation(summary = "Add a new medicine (Admin only)")
    public ResponseEntity<ApiResponse<MedicineResponse>> createMedicine(
            @Valid @RequestBody MedicineRequest request,
            @AuthenticationPrincipal User admin) {
        MedicineResponse medicine = medicineService.createMedicine(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(medicine, "Medicine added successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all medicines with pagination and search")
    public ResponseEntity<ApiResponse<PagedResponse<MedicineResponse>>> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<MedicineResponse> medicines = medicineService.getAllMedicines(page, size, search);
        return ResponseEntity.ok(ApiResponse.success(medicines, "Medicines retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get medicine by ID")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineById(@PathVariable Long id) {
        MedicineResponse medicine = medicineService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success(medicine, "Medicine retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @Operation(summary = "Update medicine details (Admin only)")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request,
            @AuthenticationPrincipal User admin) {
        MedicineResponse medicine = medicineService.updateMedicine(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success(medicine, "Medicine updated successfully"));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @Operation(summary = "Update medicine stock quantity (Admin only)")
    public ResponseEntity<ApiResponse<Void>> updateStock(
            @PathVariable Long id,
            @RequestParam int quantityChange,
            @AuthenticationPrincipal User admin) {
        medicineService.updateStock(id, quantityChange, admin);
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @Operation(summary = "Deactivate a medicine (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        medicineService.deleteMedicine(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Medicine deactivated successfully"));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @Operation(summary = "Get medicines with low stock (Admin only)")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getLowStockMedicines() {
        List<MedicineResponse> medicines = medicineService.getLowStockMedicines();
        return ResponseEntity.ok(ApiResponse.success(medicines, "Low stock medicines retrieved successfully"));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @Operation(summary = "Get medicines expiring in 30 days (Admin only)")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getExpiringMedicines() {
        List<MedicineResponse> medicines = medicineService.getExpiringMedicines();
        return ResponseEntity.ok(ApiResponse.success(medicines, "Expiring medicines retrieved successfully"));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all medicine categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = medicineService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories retrieved successfully"));
    }
}
