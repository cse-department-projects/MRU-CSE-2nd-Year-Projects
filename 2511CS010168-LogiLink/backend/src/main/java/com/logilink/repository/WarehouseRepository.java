package com.logilink.repository;

import com.logilink.entity.Organization;
import com.logilink.entity.Warehouse;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
  Optional<Warehouse> findByWarehouseCode(String warehouseCode);
  Optional<Warehouse> findByWarehouseCodeAndOrganization(String warehouseCode, Organization organization);
  List<Warehouse> findAllByOrganization(Organization organization);
  Optional<Warehouse> findByIdAndOrganization(Long id, Organization organization);
  boolean existsByWarehouseCodeAndOrganization(String warehouseCode, Organization organization);
  Optional<Warehouse> findFirstByOrganizationOrderByWarehouseCodeDesc(Organization organization);
  long countByOrganization(Organization organization);
}
