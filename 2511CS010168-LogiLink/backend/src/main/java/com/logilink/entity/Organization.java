package com.logilink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_organizations_code", columnList = "code", unique = true)
})
public class Organization {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false, unique = true)
  public String code;

  @Column(nullable = false)
  public String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public OrganizationType type = OrganizationType.COMPANY;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public OrganizationStatus status = OrganizationStatus.ACTIVE;

  public String contactEmail;
  public String contactPhone;
  public String address;
  public String operatingRegion;

  @Column(nullable = false, updatable = false)
  public Instant createdAt = Instant.now();

  @Column(nullable = false)
  public Instant updatedAt = Instant.now();

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = Instant.now();
  }

  public Organization() {}

  public Organization(String code, String name, OrganizationType type, OrganizationStatus status) {
    this.code = code;
    this.name = name;
    this.type = type != null ? type : OrganizationType.COMPANY;
    this.status = status != null ? status : OrganizationStatus.ACTIVE;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  public Organization(String code, String name, OrganizationType type, OrganizationStatus status,
                      String contactEmail, String contactPhone, String address) {
    this(code, name, type, status);
    this.contactEmail = contactEmail;
    this.contactPhone = contactPhone;
    this.address = address;
  }
}
