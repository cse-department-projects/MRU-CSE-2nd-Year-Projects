package com.logilink.repository;

import com.logilink.entity.InventoryItem;
import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
  long countByQuantityLessThanEqual(Integer quantity);
  long countByQuantityLessThanEqualAndOrganization(Integer quantity, Organization organization);

  @EntityGraph(attributePaths = {"product", "warehouse"})
  List<InventoryItem> findAllByOrganization(Organization organization);

  Optional<InventoryItem> findByIdAndOrganization(Long id, Organization organization);

  @EntityGraph(attributePaths = {"product", "warehouse"})
  List<InventoryItem> findByWarehouseAndOrganization(com.logilink.entity.Warehouse warehouse, Organization organization);

  @EntityGraph(attributePaths = {"product", "warehouse"})
  Optional<InventoryItem> findByProductAndWarehouseAndOrganization(com.logilink.entity.Product product, com.logilink.entity.Warehouse warehouse, Organization organization);

  @EntityGraph(attributePaths = {"product", "warehouse"})
  List<InventoryItem> findByProductAndOrganization(com.logilink.entity.Product product, Organization organization);

  long countByProductAndOrganization(com.logilink.entity.Product product, Organization organization);
  long countByWarehouseAndOrganization(com.logilink.entity.Warehouse warehouse, Organization organization);
  long countByOrganization(Organization organization);
}
