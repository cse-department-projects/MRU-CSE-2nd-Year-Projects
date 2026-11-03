package com.citywatch.controller;

import com.citywatch.dto.ReportDtos.*;
import com.citywatch.entity.*;
import com.citywatch.repository.AuthorityProfileRepository;
import com.citywatch.service.ReportService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/authority")
public class AuthorityController {
    private final ReportService reports;
    private final AuthorityProfileRepository authorities;

    public AuthorityController(ReportService reports, AuthorityProfileRepository authorities) {
        this.reports = reports; this.authorities = authorities;
    }

    private Long userId(Authentication a) { return Long.valueOf(a.getName()); }

    @GetMapping("/me")
    public Map<String,String> me(Authentication auth) {
        AuthorityProfile p = authorities.findByUserId(userId(auth)).orElseThrow();
        return Map.of("name", p.getUser().getName(), "email", p.getUser().getEmail(),
                "authorityId", p.getUser().getUserCode(), "department", p.getDepartment().displayName());
    }

    @GetMapping("/reports")
    public List<ReportResponse> reports(Authentication auth) {
        return reports.authorityReports(userId(auth));
    }

    @GetMapping("/notifications")
    public Map<String,Object> notifications(Authentication auth) {
        Long id = userId(auth);
        return Map.of("items", reports.notifications(id), "unread", reports.unreadNotifications(id));
    }

    @PatchMapping("/reports/{reportCode}/status")
    public ReportResponse status(@PathVariable String reportCode,
                                 @RequestBody StatusRequest request,
                                 Authentication auth) {
        return reports.updateStatus(userId(auth), reportCode, request.status());
    }
}
