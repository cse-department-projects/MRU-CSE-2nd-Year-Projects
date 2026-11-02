package com.logilink.service;

import com.logilink.dto.AuthDtos.AuthResponse;
import com.logilink.dto.AuthDtos.LoginRequest;
import com.logilink.dto.AuthDtos.RegisterRequest;
import com.logilink.dto.AuthDtos.UserResponse;
import com.logilink.entity.ActivityLog;
import com.logilink.entity.AppUser;
import com.logilink.entity.Organization;
import com.logilink.entity.OrganizationStatus;
import com.logilink.entity.OrganizationType;
import com.logilink.entity.UserRole;
import com.logilink.exception.ConflictException;
import com.logilink.exception.ResourceNotFoundException;
import com.logilink.repository.ActivityLogRepository;
import com.logilink.repository.AppUserRepository;
import com.logilink.repository.OrganizationRepository;
import com.logilink.security.JwtService;
import com.logilink.security.TenantContext;
import java.util.List;
import java.util.UUID;
import com.logilink.dto.AuthDtos.ForgotPasswordRequest;
import com.logilink.dto.AuthDtos.ForgotPasswordResponse;
import com.logilink.dto.AuthDtos.ResetPasswordRequest;
import com.logilink.dto.AuthDtos.ResetPasswordResponse;
import com.logilink.dto.AuthDtos.VerifyTokenResponse;
import com.logilink.entity.PasswordResetToken;
import com.logilink.repository.PasswordResetTokenRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final AppUserRepository users;
  private final ActivityLogRepository logs;
  private final OrganizationRepository organizations;
  private final PasswordEncoder encoder;
  private final AuthenticationManager authManager;
  private final JwtService jwt;
  private final TenantContext tenantContext;
  private final PasswordResetTokenRepository tokenRepository;
  private final EmailService emailService;
  private final String frontendUrl;
  private final int resetTokenExpirationMinutes;
  private final boolean devMode;
  private final SecureRandom secureRandom = new SecureRandom();

  public AuthService(
      AppUserRepository users,
      ActivityLogRepository logs,
      OrganizationRepository organizations,
      PasswordEncoder encoder,
      AuthenticationManager authManager,
      JwtService jwt,
      TenantContext tenantContext,
      PasswordResetTokenRepository tokenRepository,
      EmailService emailService,
      @Value("${logilink.frontend.url:http://localhost:5173}") String frontendUrl,
      @Value("${logilink.reset-token.expiration-minutes:15}") int resetTokenExpirationMinutes,
      @Value("${logilink.dev-mode:true}") boolean devMode) {
    this.users = users;
    this.logs = logs;
    this.organizations = organizations;
    this.encoder = encoder;
    this.authManager = authManager;
    this.jwt = jwt;
    this.tenantContext = tenantContext;
    this.tokenRepository = tokenRepository;
    this.emailService = emailService;
    this.frontendUrl = frontendUrl;
    this.resetTokenExpirationMinutes = resetTokenExpirationMinutes;
    this.devMode = devMode;
  }

  @Transactional
  public AuthResponse login(LoginRequest request) {
    Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
    AppUser user = users.findByEmail(auth.getName()).orElseThrow(() -> new ResourceNotFoundException("User not found."));
    logs.save(new ActivityLog(user, user.organization, "LOGIN", "User", String.valueOf(user.id), "User signed in."));
    return new AuthResponse(jwt.generate(user), toUser(user));
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (users.existsByEmail(request.email())) throw new ConflictException("Email is already registered.");
    UserRole role = request.role() == null || request.role().isBlank() ? UserRole.OPERATOR : UserRole.valueOf(request.role().toUpperCase());

    Organization userOrg = null;
    if (request.organizationCode() != null && !request.organizationCode().isBlank()) {
      userOrg = organizations.findByCode(request.organizationCode().trim().toUpperCase()).orElse(null);
    }

    if (userOrg == null && request.organizationName() != null && !request.organizationName().isBlank()) {
      String code = (request.organizationCode() != null && !request.organizationCode().isBlank())
          ? request.organizationCode().trim().toUpperCase()
          : "ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
      OrganizationType orgType = OrganizationType.COMPANY;
      if (request.organizationType() != null && !request.organizationType().isBlank()) {
        try {
          orgType = OrganizationType.fromString(request.organizationType());
        } catch (Exception ignored) {}
      }
      userOrg = organizations.save(new Organization(code, request.organizationName().trim(), orgType, OrganizationStatus.ACTIVE));
    }

    if (userOrg == null) {
      String code = "IND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
      userOrg = organizations.save(new Organization(code, request.name().trim() + "'s Workspace", OrganizationType.INDIVIDUAL, OrganizationStatus.ACTIVE));
    }

    AppUser user = users.save(new AppUser(request.name(), request.email(), encoder.encode(request.password()), role, userOrg));
    logs.save(new ActivityLog(user, userOrg, "USER_CREATED", "User", String.valueOf(user.id), "User account created in organization " + userOrg.name));
    return new AuthResponse(jwt.generate(user), toUser(user));
  }

  public UserResponse current(String email) {
    return users.findByEmail(email).map(this::toUser).orElseThrow(() -> new ResourceNotFoundException("User not found."));
  }

  public List<UserResponse> listUsers() {
    Organization org = tenantContext.getCurrentOrganization();
    return users.findAllByOrganization(org).stream().map(this::toUser).toList();
  }

  @Transactional
  public UserResponse setActive(Long id, boolean active) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = users.findByIdAndOrganization(id, org).orElseThrow(() -> new ResourceNotFoundException("User not found in organization."));
    user.active = active;
    return toUser(users.save(user));
  }

  public UserResponse toUser(AppUser user) {
    Long orgId = user.organization != null ? user.organization.id : null;
    String orgName = user.organization != null ? user.organization.name : null;
    String orgCode = user.organization != null ? user.organization.code : null;
    String orgType = user.organization != null && user.organization.type != null ? user.organization.type.name() : null;
    return new UserResponse(user.id, user.name, user.email, user.role.name(), user.active, orgId, orgName, orgCode, orgType);
  }

  @Transactional
  public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
    String email = request.email().trim().toLowerCase();
    Optional<AppUser> userOpt = users.findByEmail(email);

    if (userOpt.isEmpty() || !userOpt.get().active) {
      // Secure response: do not reveal whether the user exists
      return ForgotPasswordResponse.genericSuccess("If an account exists with that email address, password reset instructions have been generated.");
    }

    AppUser user = userOpt.get();
    tokenRepository.invalidateAllTokensForUser(user);

    byte[] randomBytes = new byte[32];
    secureRandom.nextBytes(randomBytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    Instant expiry = Instant.now().plus(Duration.ofMinutes(resetTokenExpirationMinutes));

    tokenRepository.save(new PasswordResetToken(token, user, expiry));

    String resetUrl = frontendUrl + "/reset-password?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
    boolean sent = emailService.sendPasswordResetEmail(user.email, user.name, resetUrl, resetTokenExpirationMinutes);

    if (sent) {
      return ForgotPasswordResponse.emailSent("Password reset instructions have been sent to your email address. Please check your inbox and spam folder.");
    }

    if (devMode) {
      return ForgotPasswordResponse.devFallback(token, resetUrl, "Password reset request generated. Since SMTP email delivery is not configured in this development environment, use the reset link below.");
    }

    return ForgotPasswordResponse.genericSuccess("If an account exists with that email address, password reset instructions have been generated.");
  }

  public VerifyTokenResponse verifyResetToken(String token) {
    if (token == null || token.isBlank()) {
      return new VerifyTokenResponse(false, null, "Password reset token is required.");
    }

    Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token.trim());
    if (tokenOpt.isEmpty()) {
      return new VerifyTokenResponse(false, null, "Invalid or non-existent password reset link.");
    }

    PasswordResetToken resetToken = tokenOpt.get();
    if (resetToken.used) {
      return new VerifyTokenResponse(false, null, "This password reset link has already been used. Please request a new one.");
    }

    if (resetToken.isExpired()) {
      return new VerifyTokenResponse(false, null, "This password reset link has expired. Password reset links are valid for " + resetTokenExpirationMinutes + " minutes.");
    }

    if (resetToken.user == null || !resetToken.user.active) {
      return new VerifyTokenResponse(false, null, "Associated user account is deactivated.");
    }

    return new VerifyTokenResponse(true, maskEmail(resetToken.user.email), "Reset token is valid.");
  }

  @Transactional
  public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
    if (request.token() == null || request.token().isBlank()) {
      throw new ConflictException("Password reset token is required.");
    }

    if (request.newPassword() == null || request.newPassword().length() < 6) {
      throw new ConflictException("Password must be at least 6 characters long.");
    }

    PasswordResetToken resetToken = tokenRepository.findByToken(request.token().trim())
        .orElseThrow(() -> new ConflictException("Invalid or non-existent password reset link."));

    if (resetToken.used) {
      throw new ConflictException("This password reset link has already been used. Please request a new one.");
    }

    if (resetToken.isExpired()) {
      throw new ConflictException("This password reset link has expired. Please request a new one.");
    }

    AppUser user = resetToken.user;
    if (user == null || !user.active) {
      throw new ConflictException("Associated user account is deactivated.");
    }

    user.passwordHash = encoder.encode(request.newPassword());
    users.save(user);

    resetToken.used = true;
    tokenRepository.save(resetToken);
    tokenRepository.invalidateAllTokensForUser(user);

    logs.save(new ActivityLog(user, user.organization, "PASSWORD_RESET", "User", String.valueOf(user.id), "User password was successfully reset."));

    return new ResetPasswordResponse(true, "Your password has been successfully reset. You can now log in with your new password.");
  }

  private String maskEmail(String email) {
    if (email == null || !email.contains("@")) return email;
    String[] parts = email.split("@");
    String name = parts[0];
    String domain = parts[1];
    if (name.length() <= 2) {
      return name.charAt(0) + "*@" + domain;
    }
    return name.charAt(0) + "*".repeat(Math.max(1, name.length() - 2)) + name.charAt(name.length() - 1) + "@" + domain;
  }
}
