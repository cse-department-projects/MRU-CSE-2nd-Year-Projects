package com.logilink;

import com.logilink.dto.AuthDtos.ForgotPasswordRequest;
import com.logilink.dto.AuthDtos.ForgotPasswordResponse;
import com.logilink.dto.AuthDtos.ResetPasswordRequest;
import com.logilink.dto.AuthDtos.ResetPasswordResponse;
import com.logilink.dto.AuthDtos.VerifyTokenResponse;
import com.logilink.entity.AppUser;
import com.logilink.entity.Organization;
import com.logilink.entity.OrganizationStatus;
import com.logilink.entity.OrganizationType;
import com.logilink.entity.PasswordResetToken;
import com.logilink.entity.UserRole;
import com.logilink.exception.ConflictException;
import com.logilink.repository.ActivityLogRepository;
import com.logilink.repository.AppUserRepository;
import com.logilink.repository.OrganizationRepository;
import com.logilink.repository.PasswordResetTokenRepository;
import com.logilink.security.JwtService;
import com.logilink.security.TenantContext;
import com.logilink.service.AuthService;
import com.logilink.service.EmailService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetTests {

  @Mock private AppUserRepository users;
  @Mock private ActivityLogRepository logs;
  @Mock private OrganizationRepository organizations;
  @Mock private PasswordResetTokenRepository tokenRepository;

  private TestEmailService emailService;
  private PasswordEncoder encoder;
  private AuthService authService;
  private Organization testOrg;
  private AppUser testUser;

  static class TestEmailService extends EmailService {
    boolean sendResult = false;
    boolean mailConfigured = false;
    int sendCount = 0;

    TestEmailService() {
      super(new StaticListableBeanFactory().getBeanProvider(JavaMailSender.class), false, "localhost", "noreply@logilink.edu");
    }

    @Override
    public boolean isMailConfigured() {
      return mailConfigured;
    }

    @Override
    public boolean sendPasswordResetEmail(String toEmail, String recipientName, String resetUrl, int expirationMinutes) {
      sendCount++;
      return sendResult;
    }
  }

  @BeforeEach
  void setUp() {
    encoder = new BCryptPasswordEncoder();
    testOrg = new Organization("TEST_ORG", "LogiLink Test Org", OrganizationType.COMPANY, OrganizationStatus.ACTIVE);
    testOrg.id = 100L;

    testUser = new AppUser("Kavya Menon", "admin@logilink.edu", encoder.encode("OldPassword@123"), UserRole.ADMIN, testOrg);
    testUser.id = 1L;

    emailService = new TestEmailService();
    JwtService jwt = new JwtService("change-this-development-secret-to-at-least-256-bits-before-production", 86400000L);
    TenantContext tenantContext = new TenantContext(users);
    AuthenticationManager authManager = authentication -> authentication;

    authService = new AuthService(
        users,
        logs,
        organizations,
        encoder,
        authManager,
        jwt,
        tenantContext,
        tokenRepository,
        emailService,
        "http://localhost:5173",
        15,
        true
    );
  }

  @Test
  void forgotPassword_existingUser_generatesSecureTokenAndInvalidatesPrevious() {
    when(users.findByEmail("admin@logilink.edu")).thenReturn(Optional.of(testUser));
    emailService.sendResult = false;

    ForgotPasswordResponse response = authService.forgotPassword(new ForgotPasswordRequest("admin@logilink.edu"));

    assertTrue(response.success());
    assertFalse(response.emailSent());
    assertTrue(response.devMode());
    assertNotNull(response.resetToken());
    assertNotNull(response.resetUrl());
    assertTrue(response.resetUrl().contains(response.resetToken()));

    verify(tokenRepository).invalidateAllTokensForUser(testUser);

    ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
    verify(tokenRepository).save(tokenCaptor.capture());

    PasswordResetToken savedToken = tokenCaptor.getValue();
    assertEquals(testUser, savedToken.user);
    assertFalse(savedToken.used);
    assertTrue(savedToken.expiryDate.isAfter(Instant.now().plus(14, ChronoUnit.MINUTES)));
    assertTrue(savedToken.expiryDate.isBefore(Instant.now().plus(16, ChronoUnit.MINUTES)));
  }

  @Test
  void forgotPassword_unknownUser_returnsGenericSuccessWithoutLeakingToken() {
    when(users.findByEmail("unknown@logilink.edu")).thenReturn(Optional.empty());

    ForgotPasswordResponse response = authService.forgotPassword(new ForgotPasswordRequest("unknown@logilink.edu"));

    assertTrue(response.success());
    assertFalse(response.emailSent());
    assertFalse(response.devMode());
    assertNull(response.resetToken());
    assertNull(response.resetUrl());
    assertTrue(response.message().contains("If an account exists"));

    verify(tokenRepository, never()).save(any());
  }

  @Test
  void forgotPassword_emailSentSuccessfully_returnsEmailSentStatus() {
    when(users.findByEmail("admin@logilink.edu")).thenReturn(Optional.of(testUser));
    emailService.sendResult = true;

    ForgotPasswordResponse response = authService.forgotPassword(new ForgotPasswordRequest("admin@logilink.edu"));

    assertTrue(response.success());
    assertTrue(response.emailSent());
    assertFalse(response.devMode());
    assertNull(response.resetToken());
    assertTrue(response.message().contains("sent to your email address"));
  }

  @Test
  void verifyResetToken_validToken_returnsValidAndMaskedEmail() {
    PasswordResetToken validToken = new PasswordResetToken("test-token-123", testUser, Instant.now().plus(15, ChronoUnit.MINUTES));
    when(tokenRepository.findByToken("test-token-123")).thenReturn(Optional.of(validToken));

    VerifyTokenResponse response = authService.verifyResetToken("test-token-123");

    assertTrue(response.valid());
    assertNotNull(response.email());
    assertTrue(response.email().contains("@logilink.edu"));
    assertNotEquals("admin@logilink.edu", response.email());
  }

  @Test
  void verifyResetToken_expiredToken_returnsInvalid() {
    PasswordResetToken expiredToken = new PasswordResetToken("test-token-expired", testUser, Instant.now().minus(5, ChronoUnit.MINUTES));
    when(tokenRepository.findByToken("test-token-expired")).thenReturn(Optional.of(expiredToken));

    VerifyTokenResponse response = authService.verifyResetToken("test-token-expired");

    assertFalse(response.valid());
    assertTrue(response.message().toLowerCase().contains("expired"));
  }

  @Test
  void verifyResetToken_usedToken_returnsInvalid() {
    PasswordResetToken usedToken = new PasswordResetToken("test-token-used", testUser, Instant.now().plus(15, ChronoUnit.MINUTES));
    usedToken.used = true;
    when(tokenRepository.findByToken("test-token-used")).thenReturn(Optional.of(usedToken));

    VerifyTokenResponse response = authService.verifyResetToken("test-token-used");

    assertFalse(response.valid());
    assertTrue(response.message().toLowerCase().contains("already been used"));
  }

  @Test
  void resetPassword_validToken_updatesPasswordHashAndInvalidatesToken() {
    PasswordResetToken validToken = new PasswordResetToken("valid-token-xyz", testUser, Instant.now().plus(15, ChronoUnit.MINUTES));
    when(tokenRepository.findByToken("valid-token-xyz")).thenReturn(Optional.of(validToken));

    String oldHash = testUser.passwordHash;
    String newPassword = "BrandNewPassword@2026";

    ResetPasswordResponse response = authService.resetPassword(new ResetPasswordRequest("valid-token-xyz", newPassword));

    assertTrue(response.success());
    assertTrue(validToken.used);

    // Verify password was updated and properly hashed
    assertNotEquals(oldHash, testUser.passwordHash);
    assertTrue(encoder.matches(newPassword, testUser.passwordHash));
    assertFalse(encoder.matches("OldPassword@123", testUser.passwordHash));

    // Verify user organization and role remain unchanged
    assertEquals(testOrg, testUser.organization);
    assertEquals(UserRole.ADMIN, testUser.role);
    assertEquals("Kavya Menon", testUser.name);

    verify(users).save(testUser);
    verify(tokenRepository).save(validToken);
    verify(tokenRepository).invalidateAllTokensForUser(testUser);
  }

  @Test
  void resetPassword_reusedToken_throwsConflictException() {
    PasswordResetToken usedToken = new PasswordResetToken("used-token-xyz", testUser, Instant.now().plus(15, ChronoUnit.MINUTES));
    usedToken.used = true;
    when(tokenRepository.findByToken("used-token-xyz")).thenReturn(Optional.of(usedToken));

    ConflictException ex = assertThrows(ConflictException.class, () ->
        authService.resetPassword(new ResetPasswordRequest("used-token-xyz", "NewPassword@123"))
    );

    assertTrue(ex.getMessage().toLowerCase().contains("already been used"));
    verify(users, never()).save(any());
  }

  @Test
  void resetPassword_expiredToken_throwsConflictException() {
    PasswordResetToken expiredToken = new PasswordResetToken("expired-token-xyz", testUser, Instant.now().minus(2, ChronoUnit.MINUTES));
    when(tokenRepository.findByToken("expired-token-xyz")).thenReturn(Optional.of(expiredToken));

    ConflictException ex = assertThrows(ConflictException.class, () ->
        authService.resetPassword(new ResetPasswordRequest("expired-token-xyz", "NewPassword@123"))
    );

    assertTrue(ex.getMessage().toLowerCase().contains("expired"));
    verify(users, never()).save(any());
  }

  @Test
  void resetPassword_passwordTooShort_throwsConflictException() {
    ConflictException ex = assertThrows(ConflictException.class, () ->
        authService.resetPassword(new ResetPasswordRequest("token-123", "123"))
    );

    assertTrue(ex.getMessage().toLowerCase().contains("at least 6 characters"));
    verify(tokenRepository, never()).findByToken(any());
  }
}
