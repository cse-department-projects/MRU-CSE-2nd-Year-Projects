package com.logilink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", indexes = @Index(name = "idx_users_email", columnList = "email", unique = true))
public class AppUser {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false)
  public String name;

  @Column(nullable = false, unique = true)
  public String email;

  @Column(nullable = false)
  public String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public UserRole role = UserRole.OPERATOR;

  @Column(nullable = false)
  public boolean active = true;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @Column(nullable = false, updatable = false)
  public Instant createdAt = Instant.now();

  public AppUser() {}

  public AppUser(String name, String email, String passwordHash, UserRole role) {
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  public AppUser(String name, String email, String passwordHash, UserRole role, Organization organization) {
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.organization = organization;
  }
}
