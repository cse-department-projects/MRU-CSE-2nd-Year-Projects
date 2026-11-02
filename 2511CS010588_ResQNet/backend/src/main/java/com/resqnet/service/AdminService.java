package com.resqnet.service;

import com.resqnet.dto.admin.AdminStatsResponse;
import com.resqnet.dto.admin.AdminUserSummaryResponse;
import com.resqnet.enums.Role;

import java.util.List;

public interface AdminService {
    List<AdminUserSummaryResponse> getAllUsers(Role role, Boolean isActive);
    AdminUserSummaryResponse getUserById(Long userId);
    AdminUserSummaryResponse updateUserStatus(Long userId, Boolean isActive);
    AdminUserSummaryResponse updateUserRole(Long userId, Role role);
    AdminStatsResponse getAdminStats();
}
