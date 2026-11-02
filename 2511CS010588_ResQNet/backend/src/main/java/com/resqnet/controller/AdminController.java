package com.resqnet.controller;

import com.resqnet.dto.admin.AdminStatsResponse;
import com.resqnet.dto.admin.AdminUserSummaryResponse;
import com.resqnet.dto.admin.UpdateUserRoleRequest;
import com.resqnet.dto.admin.UpdateUserStatusRequest;
import com.resqnet.dto.common.ApiResponse;
import com.resqnet.enums.Role;
import com.resqnet.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserSummaryResponse>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean isActive) {
        List<AdminUserSummaryResponse> users = adminService.getAllUsers(role, isActive);
        return ResponseEntity.ok(ApiResponse.ok(users, "System users retrieved successfully"));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserSummaryResponse>> getUserById(@PathVariable Long id) {
        AdminUserSummaryResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user, "User details retrieved successfully"));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserSummaryResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        AdminUserSummaryResponse updated = adminService.updateUserStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.ok(updated, "User active status updated"));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserSummaryResponse>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        AdminUserSummaryResponse updated = adminService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.ok(updated, "User role permission level updated"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getAdminStats() {
        AdminStatsResponse stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok(stats, "Real-time system command statistics"));
    }
}
