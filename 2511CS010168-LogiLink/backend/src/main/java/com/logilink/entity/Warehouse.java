package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "warehouses", indexes = {
    @Index(name = "idx_warehouses_code", columnList = "warehouseCode", unique = true),
    @Index(name = "idx_warehouses_org", columnList = "organization_id")
})
public class Warehouse {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false, unique = true)
  public String warehouseCode;

  @Column(nullable = false)
  public String name;

  public String location;
  public String capacity;
  public Integer occupancy = 0;
  public Integer inventoryCount = 0;
  public String status;
  public Integer incoming = 0;
  public Integer outgoing = 0;
  public String manager;
  public String contact;

  public Warehouse() {}
}
