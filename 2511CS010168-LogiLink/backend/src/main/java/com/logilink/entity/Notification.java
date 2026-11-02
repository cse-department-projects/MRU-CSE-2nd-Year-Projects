package com.logilink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_org", columnList = "organization_id")
})
public class Notification {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long pk;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @Column(nullable = false, unique = true)
  public String notificationId;

  public String title;
  @Column(length = 1000)
  public String description;
  public String priority;
  public String type;
  public String displayTime;
  public boolean readFlag = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  public AppUser user;

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  public Notification() {}
}
