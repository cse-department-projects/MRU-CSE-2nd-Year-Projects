package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "drivers", indexes = {
    @Index(name = "idx_drivers_driver_id", columnList = "driverId", unique = true),
    @Index(name = "idx_drivers_org", columnList = "organization_id")
})
public class Driver {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false, unique = true)
  public String driverId;

  @Column(nullable = false)
  public String name;

  public String contact;
  public String status;
  public Integer totalTrips = 0;
  public Double successRate = 0.0;
  public Double rating = 0.0;
  public String base;

  public Driver() {}
}
