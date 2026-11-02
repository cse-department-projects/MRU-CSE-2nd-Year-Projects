package com.careerguidance.controller;

import com.careerguidance.dto.InternshipDto;
import com.careerguidance.dto.MessageResponse;
import com.careerguidance.service.InternshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internships")
public class InternshipController {

    private final InternshipService internshipService;

    public InternshipController(InternshipService internshipService) {
        this.internshipService = internshipService;
    }

    @GetMapping
    public ResponseEntity<List<InternshipDto>> getInternships(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String location
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(internshipService.getInternships(email, search, workMode, location));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<InternshipDto>> getRecommendedInternships(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(internshipService.getRecommendedInternships(email));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<InternshipDto> saveInternship(Authentication authentication, @PathVariable String id) {
        String email = authentication.getName();
        return ResponseEntity.ok(internshipService.saveInternship(email, id));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<?> unsaveInternship(Authentication authentication, @PathVariable String id) {
        String email = authentication.getName();
        internshipService.unsaveInternship(email, id);
        return ResponseEntity.ok(new MessageResponse(true, "Internship removed from saved list."));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<InternshipDto>> getSavedInternships(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(internshipService.getSavedInternships(email));
    }
}
