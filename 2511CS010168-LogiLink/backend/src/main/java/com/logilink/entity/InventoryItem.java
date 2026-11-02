package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory", uniqueConstraints = @UniqueConstraint(name = "uk_inventory_product_warehouse", columnNames = {"product_id", "warehouse_id"}), indexes = {
    @Index(name = "idx_inventory_org", columnList = "organization_id")
})
public class InventoryItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "product_id")
  public Product product;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "warehouse_id")
  public Warehouse warehouse;

  public Integer quantity = 0;
  public Integer reserved = 0;
  public Integer reorderLevel = 0;

  public InventoryItem() {}

  public int available() {
    return Math.max(0, quantity - reserved);
  }
}
