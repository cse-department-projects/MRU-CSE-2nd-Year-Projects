package com.careerguidance.controller;

import com.careerguidance.model.SkillGap;
import com.careerguidance.service.SkillGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/skill-gap")
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @GetMapping("/career/{careerId}")
    public ResponseEntity<SkillGap> analyzeSkillGap(Authentication authentication, @PathVariable String careerId) {
        String email = authentication.getName();
        return ResponseEntity.ok(skillGapService.analyzeSkillGap(email, careerId));
    }

    @PostMapping("/mark-skill-completed")
    public ResponseEntity<SkillGap> markSkillCompleted(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        String email = authentication.getName();
        String careerId = payload.get("careerId");
        String skillName = payload.get("skillName");
        return ResponseEntity.ok(skillGapService.markSkillCompleted(email, careerId, skillName));
    }
}
