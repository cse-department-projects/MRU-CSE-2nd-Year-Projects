package com.logilink.repository;

import com.logilink.entity.LogisticsOrder;
import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogisticsOrderRepository extends JpaRepository<LogisticsOrder, Long> {
  @Override
  @EntityGraph(attributePaths = {"customer", "vehicle", "driver", "route"})
  List<LogisticsOrder> findAll();

  @EntityGraph(attributePaths = {"customer", "vehicle", "driver", "route"})
  Optional<LogisticsOrder> findByOrderId(String orderId);

  @EntityGraph(attributePaths = {"customer", "vehicle", "driver", "route"})
  Optional<LogisticsOrder> findByOrderIdAndOrganization(String orderId, Organization organization);

  @Override
  @EntityGraph(attributePaths = {"customer", "vehicle", "driver", "route"})
  Optional<LogisticsOrder> findById(Long id);

  @EntityGraph(attributePaths = {"customer", "vehicle", "driver", "route"})
  Optional<LogisticsOrder> findByIdAndOrganization(Long id, Organization organization);

  @EntityGraph(attributePaths = {"customer", "vehicle", "driver", "route"})
  List<LogisticsOrder> findAllByOrganization(Organization organization);

  long countByStatus(String status);
  long countByStatusAndOrganization(String status, Organization organization);
  long countByOrganization(Organization organization);

  List<LogisticsOrder> findByStatus(String status);
  List<LogisticsOrder> findByStatusAndOrganization(String status, Organization organization);
}
