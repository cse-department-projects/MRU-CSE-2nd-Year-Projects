package com.careerguidance.controller;

import com.careerguidance.dto.ResumeAnalysisRequest;
import com.careerguidance.dto.ResumeAnalysisResponse;
import com.careerguidance.dto.ResumeJobMatchRequest;
import com.careerguidance.dto.ResumeJobMatchResponse;
import com.careerguidance.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/resume", "/api/resume-match"})
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<ResumeAnalysisResponse> analyzeResume(
            Authentication authentication,
            @RequestBody ResumeAnalysisRequest request
    ) {
        String email = authentication != null ? authentication.getName() : "demo@example.com";
        return ResponseEntity.ok(resumeService.analyzeResume(email, request));
    }

    @GetMapping("/latest")
    public ResponseEntity<ResumeAnalysisResponse> getLatestResume(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "demo@example.com";
        return ResponseEntity.ok(resumeService.getLatestResumeAnalysis(email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ResumeAnalysisResponse>> getAllResumes(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "demo@example.com";
        return ResponseEntity.ok(resumeService.getAllResumeAnalyses(email));
    }

    @PostMapping({"/match-job", "/match", "/analyze-match"})
    public ResponseEntity<ResumeJobMatchResponse> matchWithJob(
            Authentication authentication,
            @RequestBody ResumeJobMatchRequest request
    ) {
        return ResponseEntity.ok(resumeService.matchResumeWithJob(request));
    }
}
