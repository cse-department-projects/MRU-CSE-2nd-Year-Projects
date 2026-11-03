package com.citywatch.controller;

import com.citywatch.dto.ReportDtos.*;
import com.citywatch.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/citizen")
public class CitizenController {
    private final ReportService reports;
    public CitizenController(ReportService reports) { this.reports = reports; }

    private Long userId(Authentication a) { return Long.valueOf(a.getName()); }

    @PostMapping("/reports")
    public ReportResponse create(@Valid @RequestBody CreateReportRequest request, Authentication auth) {
        return reports.create(userId(auth), request);
    }

    @GetMapping("/reports")
    public List<ReportResponse> myReports(Authentication auth) {
        return reports.citizenReports(userId(auth));
    }

    @GetMapping("/notifications")
    public Map<String,Object> notifications(Authentication auth) {
        Long id = userId(auth);
        return Map.of("items", reports.notifications(id), "unread", reports.unreadNotifications(id));
    }

    @PatchMapping("/notifications/{id}/read")
    public void read(@PathVariable Long id, Authentication auth) {
        reports.markNotificationRead(userId(auth), id);
    }
}
