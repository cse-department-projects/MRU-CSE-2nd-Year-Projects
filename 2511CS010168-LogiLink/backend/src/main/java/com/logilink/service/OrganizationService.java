package com.logilink.service;

import com.logilink.entity.Organization;
import com.logilink.entity.OrganizationStatus;
import com.logilink.entity.OrganizationType;
import com.logilink.exception.ConflictException;
import com.logilink.exception.ResourceNotFoundException;
import com.logilink.repository.OrganizationRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OrganizationService {
  private final OrganizationRepository organizations;

  public OrganizationService(OrganizationRepository organizations) {
    this.organizations = organizations;
  }

  @Transactional
  public Organization createOrganization(String code, String name, OrganizationType type, OrganizationStatus status,
                                         String contactEmail, String contactPhone, String address) {
    if (code == null || code.trim().isEmpty()) {
      throw new IllegalArgumentException("Organization code must not be empty.");
    }
    if (name == null || name.trim().isEmpty()) {
      throw new IllegalArgumentException("Organization name must not be empty.");
    }
    String normalizedCode = code.trim().toUpperCase();
    if (organizations.existsByCode(normalizedCode)) {
      throw new ConflictException("Organization code already exists: " + normalizedCode);
    }
    Organization org = new Organization(
        normalizedCode,
        name.trim(),
        type != null ? type : OrganizationType.COMPANY,
        status != null ? status : OrganizationStatus.ACTIVE,
        contactEmail != null ? contactEmail.trim() : null,
        contactPhone != null ? contactPhone.trim() : null,
        address != null ? address.trim() : null
    );
    return organizations.save(org);
  }

  public Organization findById(Long id) {
    return organizations.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
  }

  public Organization findByCode(String code) {
    if (code == null || code.trim().isEmpty()) {
      throw new IllegalArgumentException("Organization code must not be empty.");
    }
    return organizations.findByCode(code.trim().toUpperCase())
        .orElseThrow(() -> new ResourceNotFoundException("Organization not found with code: " + code));
  }

  public Optional<Organization> findOptionalByCode(String code) {
    if (code == null || code.trim().isEmpty()) {
      return Optional.empty();
    }
    return organizations.findByCode(code.trim().toUpperCase());
  }

  public boolean existsByCode(String code) {
    if (code == null || code.trim().isEmpty()) {
      return false;
    }
    return organizations.existsByCode(code.trim().toUpperCase());
  }
}
