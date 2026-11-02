package com.careerguidance.controller;

import com.careerguidance.dto.CareerMatchDto;
import com.careerguidance.model.Career;
import com.careerguidance.service.CareerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/careers")
public class CareerController {

    private final CareerService careerService;

    public CareerController(CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping
    public ResponseEntity<List<Career>> getAllCareers() {
        return ResponseEntity.ok(careerService.getAllCareers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Career> getCareerById(@PathVariable String id) {
        return ResponseEntity.ok(careerService.getCareerById(id));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<CareerMatchDto>> getRecommendations(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(careerService.getCareerRecommendations(email));
    }

    @GetMapping("/{id}/match")
    public ResponseEntity<CareerMatchDto> getCareerMatch(Authentication authentication, @PathVariable String id) {
        String email = authentication.getName();
        return ResponseEntity.ok(careerService.getCareerMatch(email, id));
    }
}
