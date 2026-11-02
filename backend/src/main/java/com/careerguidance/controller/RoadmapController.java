package com.careerguidance.controller;

import com.careerguidance.model.Roadmap;
import com.careerguidance.service.RoadmapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping("/my-roadmaps")
    public ResponseEntity<List<Roadmap>> getUserRoadmaps(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(roadmapService.getUserRoadmaps(email));
    }

    @GetMapping("/career/{careerId}")
    public ResponseEntity<Roadmap> getRoadmapByCareer(Authentication authentication, @PathVariable String careerId) {
        String email = authentication.getName();
        return ResponseEntity.ok(roadmapService.getRoadmapByCareer(email, careerId));
    }

    @PostMapping("/start/{careerId}")
    public ResponseEntity<Roadmap> startRoadmap(Authentication authentication, @PathVariable String careerId) {
        String email = authentication.getName();
        return ResponseEntity.ok(roadmapService.startRoadmap(email, careerId));
    }

    @PutMapping("/{roadmapId}/toggle-task")
    public ResponseEntity<Roadmap> toggleTask(
            Authentication authentication,
            @PathVariable String roadmapId,
            @RequestBody Map<String, String> payload
    ) {
        String email = authentication.getName();
        String taskId = payload.get("taskId");
        return ResponseEntity.ok(roadmapService.toggleTask(email, roadmapId, taskId));
    }

    @PutMapping("/{roadmapId}/reset")
    public ResponseEntity<Roadmap> resetRoadmap(Authentication authentication, @PathVariable String roadmapId) {
        String email = authentication.getName();
        return ResponseEntity.ok(roadmapService.resetRoadmap(email, roadmapId));
    }
}
