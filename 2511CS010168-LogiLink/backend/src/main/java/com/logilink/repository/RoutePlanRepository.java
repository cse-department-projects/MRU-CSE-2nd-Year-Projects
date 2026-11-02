package com.logilink.repository;

import com.logilink.entity.Organization;
import com.logilink.entity.RoutePlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutePlanRepository extends JpaRepository<RoutePlan, Long> {
  Optional<RoutePlan> findByRouteId(String routeId);
  Optional<RoutePlan> findByRouteIdAndOrganization(String routeId, Organization organization);
  List<RoutePlan> findAllByOrganization(Organization organization);
  Optional<RoutePlan> findByPkAndOrganization(Long pk, Organization organization);
  long countByOrganization(Organization organization);
}
