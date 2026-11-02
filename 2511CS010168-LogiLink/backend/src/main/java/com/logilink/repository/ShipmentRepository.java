package com.logilink.repository;

import com.logilink.entity.LogisticsOrder;
import com.logilink.entity.Organization;
import com.logilink.entity.Shipment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
  @Override
  @EntityGraph(attributePaths = {"order", "order.customer", "vehicle", "driver", "route"})
  List<Shipment> findAll();

  @Override
  @EntityGraph(attributePaths = {"order", "order.customer", "vehicle", "driver", "route"})
  Optional<Shipment> findById(Long id);

  @EntityGraph(attributePaths = {"order", "order.customer", "vehicle", "driver", "route"})
  Optional<Shipment> findByShipmentId(String shipmentId);

  @EntityGraph(attributePaths = {"order", "order.customer", "vehicle", "driver", "route"})
  Optional<Shipment> findByShipmentIdAndOrganization(String shipmentId, Organization organization);

  @EntityGraph(attributePaths = {"order", "order.customer", "vehicle", "driver", "route"})
  Optional<Shipment> findByIdAndOrganization(Long id, Organization organization);

  @EntityGraph(attributePaths = {"order", "order.customer", "vehicle", "driver", "route"})
  List<Shipment> findAllByOrganization(Organization organization);

  long countByStatus(String status);
  long countByStatusAndOrganization(String status, Organization organization);
  long countByOrganization(Organization organization);

  @EntityGraph(attributePaths = {"order", "order.customer", "vehicle", "driver", "route"})
  Optional<Shipment> findByOrderAndOrganization(LogisticsOrder order, Organization organization);
}
