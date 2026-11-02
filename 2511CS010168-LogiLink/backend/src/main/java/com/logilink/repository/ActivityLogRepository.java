package com.logilink.repository;

import com.logilink.entity.ActivityLog;
import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
  List<ActivityLog> findAllByOrganization(Organization organization);
  List<ActivityLog> findAllByOrganizationOrderByTimestampDesc(Organization organization);
  Optional<ActivityLog> findByIdAndOrganization(Long id, Organization organization);
  long countByOrganization(Organization organization);
}
