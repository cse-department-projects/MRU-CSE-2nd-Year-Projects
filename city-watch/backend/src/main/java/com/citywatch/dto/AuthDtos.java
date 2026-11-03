package com.citywatch.dto;

import jakarta.validation.constraints.*;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(
            @NotBlank String email,
            @NotBlank String password) {}

    public record CitizenRegisterRequest(
            @NotBlank @Size(min=2, max=100) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min=7, max=20) String phone,
            @NotBlank @Size(min=6, max=100) String password) {}

    public record AuthResponse(
            String token,
            String userCode,
            String name,
            String role,
            String department) {}
}