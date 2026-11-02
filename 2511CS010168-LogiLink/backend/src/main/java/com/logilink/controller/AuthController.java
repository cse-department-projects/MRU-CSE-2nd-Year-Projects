package com.logilink.controller;

import com.logilink.dto.AuthDtos.AuthResponse;
import com.logilink.dto.AuthDtos.ForgotPasswordRequest;
import com.logilink.dto.AuthDtos.ForgotPasswordResponse;
import com.logilink.dto.AuthDtos.LoginRequest;
import com.logilink.dto.AuthDtos.RegisterRequest;
import com.logilink.dto.AuthDtos.ResetPasswordRequest;
import com.logilink.dto.AuthDtos.ResetPasswordResponse;
import com.logilink.dto.AuthDtos.UserResponse;
import com.logilink.dto.AuthDtos.VerifyTokenResponse;
import com.logilink.service.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {
  private final AuthService auth;

  public AuthController(AuthService auth) {
    this.auth = auth;
  }

  @PostMapping("/auth/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return auth.login(request);
  }

  @PostMapping("/auth/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return auth.register(request);
  }

  @PostMapping("/auth/forgot-password")
  public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    return auth.forgotPassword(request);
  }

  @GetMapping("/auth/verify-reset-token")
  public VerifyTokenResponse verifyResetToken(@RequestParam String token) {
    return auth.verifyResetToken(token);
  }

  @PostMapping("/auth/reset-password")
  public ResetPasswordResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    return auth.resetPassword(request);
  }

  @PostMapping("/auth/logout")
  public Map<String, Object> logout() {
    return Map.of("message", "Signed out successfully.");
  }

  @GetMapping("/auth/me")
  public UserResponse me(Principal principal) {
    return auth.current(principal.getName());
  }

  @GetMapping("/users")
  @PreAuthorize("hasRole('ADMIN')")
  public List<UserResponse> users() {
    return auth.listUsers();
  }

  @PatchMapping("/users/{id}/active")
  @PreAuthorize("hasRole('ADMIN')")
  public UserResponse active(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
    return auth.setActive(id, body.getOrDefault("active", true));
  }
}
