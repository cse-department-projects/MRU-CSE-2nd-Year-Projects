package com.logilink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_preferences", indexes = {
    @Index(name = "idx_user_preferences_user", columnList = "user_id", unique = true)
})
public class UserPreferences {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  public AppUser user;

  public String theme = "Light";
  public String density = "Default";
  public String alertThreshold = "Default";
  public String digestFrequency = "Daily";
  public String sessionPolicy = "Standard (24h)";
  public String passwordPolicy = "Strong";
  public String timezone = "Asia/Kolkata (IST)";
  public String defaultWarehouse = "WH-HYD-CEN";

  @Column(nullable = false)
  public Instant updatedAt = Instant.now();

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = Instant.now();
  }

  public UserPreferences() {}

  public UserPreferences(AppUser user) {
    this.user = user;
    this.theme = "Light";
    this.density = "Default";
    this.alertThreshold = "Default";
    this.digestFrequency = "Daily";
    this.sessionPolicy = "Standard (24h)";
    this.passwordPolicy = "Strong";
    this.timezone = "Asia/Kolkata (IST)";
    this.defaultWarehouse = "WH-HYD-CEN";
    this.updatedAt = Instant.now();
  }
}
