package com.logilink.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "shipments", indexes = {
    @Index(name = "idx_shipments_shipment_id", columnList = "shipmentId", unique = true),
    @Index(name = "idx_shipments_org", columnList = "organization_id")
})
public class Shipment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false, unique = true)
  public String shipmentId;

  @OneToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "order_id")
  public LogisticsOrder order;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "vehicle_id")
  public Vehicle vehicle;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "driver_id")
  public Driver driver;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "route_id")
  public RoutePlan route;

  public String currentLocation;
  public String status;
  public String eta;
  public String stage;
  public LocalDate createdDate = LocalDate.now();

  public Shipment() {}
}
