package com.logilink.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_order_id", columnList = "orderId", unique = true),
    @Index(name = "idx_orders_status", columnList = "status"),
    @Index(name = "idx_orders_org", columnList = "organization_id")
})
public class LogisticsOrder {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false, unique = true)
  public String orderId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "customer_id")
  public Customer customer;

  public String origin;
  public String destination;
  public String cargo;
  public String weight;
  public String priority;
  public String status;
  public String eta;
  public LocalDate createdDate;
  public LocalDate pickupDate;
  public LocalDate deliveryDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vehicle_id")
  public Vehicle vehicle;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_id")
  public Driver driver;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "route_id")
  public RoutePlan route;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  public List<OrderItem> items = new ArrayList<>();

  public LogisticsOrder() {}
}
