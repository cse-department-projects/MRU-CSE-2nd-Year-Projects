package com.logilink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens", indexes = {
    @Index(name = "idx_reset_token", columnList = "token", unique = true),
    @Index(name = "idx_reset_token_user", columnList = "user_id")
})
public class PasswordResetToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false, unique = true, length = 128)
  public String token;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  public AppUser user;

  @Column(nullable = false)
  public Instant expiryDate;

  @Column(nullable = false)
  public boolean used = false;

  @Column(nullable = false, updatable = false)
  public Instant createdAt = Instant.now();

  public PasswordResetToken() {}

  public PasswordResetToken(String token, AppUser user, Instant expiryDate) {
    this.token = token;
    this.user = user;
    this.expiryDate = expiryDate;
    this.used = false;
    this.createdAt = Instant.now();
  }

  public boolean isExpired() {
    return Instant.now().isAfter(this.expiryDate);
  }
}
