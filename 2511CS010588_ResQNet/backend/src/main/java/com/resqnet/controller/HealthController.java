package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> status = Map.of(
                "status", "UP",
                "service", "ResQNet Backend API",
                "version", "1.0.0",
                "database", "ResQUnit_DB_Final"
        );
        return ResponseEntity.ok(ApiResponse.ok(status, "ResQNet service is running smoothly"));
    }
}
