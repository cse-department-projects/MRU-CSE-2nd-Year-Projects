package com.citywatch.controller;

import com.citywatch.dto.AuthDtos.*;
import com.citywatch.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService users;
    public AuthController(UserService users) { this.users = users; }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody CitizenRegisterRequest request) {
        return users.registerCitizen(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return users.login(request);
    }
}
