package com.logilink.repository;

import com.logilink.entity.Organization;
import com.logilink.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
  Optional<Product> findBySku(String sku);
  Optional<Product> findBySkuAndOrganization(String sku, Organization organization);
  List<Product> findAllByOrganization(Organization organization);
  Optional<Product> findByIdAndOrganization(Long id, Organization organization);
  boolean existsBySkuAndOrganization(String sku, Organization organization);
  Optional<Product> findFirstByOrganizationOrderBySkuDesc(Organization organization);
  long countByOrganization(Organization organization);
}
