package com.careerguidance.controller;

import com.careerguidance.dto.DashboardSummaryDto;
import com.careerguidance.dto.UserProfileDto;
import com.careerguidance.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/user", "/api/users"})
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfileDto profile = authService.getProfile(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateUserProfile(Authentication authentication, @RequestBody UserProfileDto dto) {
        String email = authentication.getName();
        UserProfileDto updated = authService.updateProfile(email, dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(Authentication authentication) {
        String email = authentication.getName();
        DashboardSummaryDto summary = authService.getDashboardSummary(email);
        return ResponseEntity.ok(summary);
    }
}
