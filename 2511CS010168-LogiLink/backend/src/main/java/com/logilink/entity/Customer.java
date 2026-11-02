package com.logilink.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "customers", indexes = {
    @Index(name = "idx_customers_email", columnList = "email"),
    @Index(name = "idx_customers_org", columnList = "organization_id")
})
public class Customer {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = true)
  public AppUser owner;

  @Column(nullable = false)
  public String name;

  public String contact;
  public String email;

  public Customer() {}

  public Customer(String name, String contact, String email) {
    this.name = name;
    this.contact = contact;
    this.email = email;
  }

  public Customer(String name, String contact, String email, Organization organization) {
    this(name, contact, email);
    this.organization = organization;
  }
}
