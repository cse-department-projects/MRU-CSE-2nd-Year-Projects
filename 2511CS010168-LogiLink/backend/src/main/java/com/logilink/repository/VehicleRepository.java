package com.logilink.repository;

import com.logilink.entity.Organization;
import com.logilink.entity.Vehicle;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
  @Override
  @EntityGraph(attributePaths = {"driver"})
  List<Vehicle> findAll();

  @Override
  @EntityGraph(attributePaths = {"driver"})
  Optional<Vehicle> findById(Long id);

  @EntityGraph(attributePaths = {"driver"})
  Optional<Vehicle> findByVehicleId(String vehicleId);

  @EntityGraph(attributePaths = {"driver"})
  Optional<Vehicle> findByVehicleIdAndOrganization(String vehicleId, Organization organization);

  long countByStatus(String status);
  long countByStatusAndOrganization(String status, Organization organization);
  long countByOrganization(Organization organization);
  List<Vehicle> findByStatusIn(List<String> statuses);

  @EntityGraph(attributePaths = {"driver"})
  List<Vehicle> findAllByOrganization(Organization organization);

  @EntityGraph(attributePaths = {"driver"})
  Optional<Vehicle> findByIdAndOrganization(Long id, Organization organization);
}
