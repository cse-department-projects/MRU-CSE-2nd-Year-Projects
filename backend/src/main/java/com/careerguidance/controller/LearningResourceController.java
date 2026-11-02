package com.careerguidance.controller;

import com.careerguidance.model.LearningResource;
import com.careerguidance.service.LearningResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class LearningResourceController {

    private final LearningResourceService resourceService;

    public LearningResourceController(LearningResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<LearningResource>> getResources(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(resourceService.getResources(skill, difficulty, type));
    }
}
