package com.careerguidance.controller;

import com.careerguidance.dto.JobDto;
import com.careerguidance.dto.MessageResponse;
import com.careerguidance.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<JobDto>> getJobs(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "0") Integer minMatch
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(jobService.getJobs(email, search, workMode, location, minMatch));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<JobDto>> getRecommendedJobs(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(jobService.getRecommendedJobs(email));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<JobDto> saveJob(Authentication authentication, @PathVariable String id) {
        String email = authentication.getName();
        return ResponseEntity.ok(jobService.saveJob(email, id));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<?> unsaveJob(Authentication authentication, @PathVariable String id) {
        String email = authentication.getName();
        jobService.unsaveJob(email, id);
        return ResponseEntity.ok(new MessageResponse(true, "Job removed from saved list."));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<JobDto>> getSavedJobs(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(jobService.getSavedJobs(email));
    }
}
