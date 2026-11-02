package com.logilink.repository;

import com.logilink.entity.Driver;
import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
  Optional<Driver> findByDriverId(String driverId);
  Optional<Driver> findByDriverIdAndOrganization(String driverId, Organization organization);
  List<Driver> findAllByOrganization(Organization organization);
  Optional<Driver> findByIdAndOrganization(Long id, Organization organization);
  long countByOrganization(Organization organization);
}
