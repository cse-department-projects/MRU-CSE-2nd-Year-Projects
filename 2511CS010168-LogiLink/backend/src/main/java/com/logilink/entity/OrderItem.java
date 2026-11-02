package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id")
  public LogisticsOrder order;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id")
  public Product product;

  public Integer quantity = 1;
  public String weight;

  public OrderItem() {}
}
