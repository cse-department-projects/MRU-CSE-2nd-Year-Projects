package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products", uniqueConstraints = {
    @UniqueConstraint(name = "uk_products_sku_org", columnNames = {"sku", "organization_id"})
}, indexes = {
    @Index(name = "idx_products_org", columnList = "organization_id")
})
public class Product {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false)
  public String sku;

  @Column(nullable = false)
  public String name;

  public String category;
  public String description;
  public String unit = "units";
  public Double price = 0.0;
  public String status = "Active";

  public Product() {}
}
