package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicles_vehicle_id", columnList = "vehicleId", unique = true),
    @Index(name = "idx_vehicles_org", columnList = "organization_id")
})
public class Vehicle {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false, unique = true)
  public String vehicleId;

  @Column(nullable = false, unique = true)
  public String registration;

  public String type;
  public String capacity;
  public Double capacityValue = 0.0;
  public Integer currentLoad = 0;
  public String status;
  public String location;
  public Double currentLat;
  public Double currentLng;
  public String lastUpdated;
  public String maintenance;
  public String route;
  public Integer utilization = 0;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "driver_id")
  public Driver driver;

  public Vehicle() {}
}
