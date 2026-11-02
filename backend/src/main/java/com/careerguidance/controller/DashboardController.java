package com.careerguidance.controller;

import com.careerguidance.dto.DashboardSummaryDto;
import com.careerguidance.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AuthService authService;

    public DashboardController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<DashboardSummaryDto> getDashboard(Authentication authentication) {
        String email = authentication.getName();
        DashboardSummaryDto summary = authService.getDashboardSummary(email);
        return ResponseEntity.ok(summary);
    }
}
