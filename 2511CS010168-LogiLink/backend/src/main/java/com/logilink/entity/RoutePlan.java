package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "routes", indexes = {
    @Index(name = "idx_routes_org", columnList = "organization_id")
})
public class RoutePlan {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long pk;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false, unique = true)
  public String routeId;

  public String origin;
  public String destination;
  public String stops;
  public String distance;
  public String estimatedTime;
  public String fuelEstimate;
  public String status;
  public Double originLat;
  public Double originLng;
  public Double destinationLat;
  public Double destinationLng;

  @Column(columnDefinition = "TEXT")
  public String stopsData;

  @Column(columnDefinition = "MEDIUMTEXT")
  public String routeGeometry;

  public String optimizedOrder;

  @Column(name = "created_at")
  public java.time.Instant createdAt = java.time.Instant.now();

  public java.time.Instant updatedAt = java.time.Instant.now();

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "vehicle_id")
  public Vehicle vehicle;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "driver_id")
  public Driver driver;

  @PreUpdate
  public void onUpdate() {
    this.updatedAt = java.time.Instant.now();
  }

  public RoutePlan() {}
}
