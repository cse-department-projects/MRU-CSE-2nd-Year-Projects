package com.logilink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_activity_logs_org", columnList = "organization_id")
})
public class ActivityLog {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  public AppUser user;

  public String action;
  public String entityType;
  public String entityId;

  @Column(length = 1000)
  public String description;

  @Column(nullable = false)
  public Instant timestamp = Instant.now();

  public ActivityLog() {}

  public ActivityLog(AppUser user, String action, String entityType, String entityId, String description) {
    this.user = user;
    this.organization = user != null ? user.organization : null;
    this.action = action;
    this.entityType = entityType;
    this.entityId = entityId;
    this.description = description;
  }

  public ActivityLog(AppUser user, Organization organization, String action, String entityType, String entityId, String description) {
    this.user = user;
    this.organization = organization != null ? organization : (user != null ? user.organization : null);
    this.action = action;
    this.entityType = entityType;
    this.entityId = entityId;
    this.description = description;
  }
}
