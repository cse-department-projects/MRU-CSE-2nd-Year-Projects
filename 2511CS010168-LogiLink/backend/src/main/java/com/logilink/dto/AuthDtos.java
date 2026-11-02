package com.logilink.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
  public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

  public record RegisterRequest(
      @NotBlank String name,
      @Email @NotBlank String email,
      @NotBlank String password,
      String role,
      String organizationName,
      String organizationCode,
      String organizationType
  ) {
    public RegisterRequest(String name, String email, String password, String role) {
      this(name, email, password, role, null, null, null);
    }
  }

  public record AuthResponse(String token, UserResponse user) {}

  public record UserResponse(
      Long id,
      String name,
      String email,
      String role,
      boolean active,
      Long organizationId,
      String organizationName,
      String organizationCode,
      String organizationType
  ) {
    public UserResponse(Long id, String name, String email, String role, boolean active) {
      this(id, name, email, role, active, null, null, null, null);
    }
  }

  public record ForgotPasswordRequest(@Email @NotBlank String email) {}

  public record ForgotPasswordResponse(
      boolean success,
      boolean emailSent,
      boolean devMode,
      String resetToken,
      String resetUrl,
      String message
  ) {
    public static ForgotPasswordResponse emailSent(String message) {
      return new ForgotPasswordResponse(true, true, false, null, null, message);
    }

    public static ForgotPasswordResponse devFallback(String token, String resetUrl, String message) {
      return new ForgotPasswordResponse(true, false, true, token, resetUrl, message);
    }

    public static ForgotPasswordResponse genericSuccess(String message) {
      return new ForgotPasswordResponse(true, false, false, null, null, message);
    }
  }

  public record ResetPasswordRequest(
      @NotBlank String token,
      @NotBlank String newPassword
  ) {}

  public record ResetPasswordResponse(
      boolean success,
      String message
  ) {}

  public record VerifyTokenResponse(
      boolean valid,
      String email,
      String message
  ) {}
}
