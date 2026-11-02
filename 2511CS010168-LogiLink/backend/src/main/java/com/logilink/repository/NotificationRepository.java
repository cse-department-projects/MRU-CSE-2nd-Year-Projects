package com.logilink.repository;

import com.logilink.entity.AppUser;
import com.logilink.entity.Notification;
import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  Optional<Notification> findByNotificationId(String notificationId);
  Optional<Notification> findByNotificationIdAndOrganization(String notificationId, Organization organization);
  Optional<Notification> findByPkAndOrganization(Long pk, Organization organization);
  List<Notification> findAllByOrganization(Organization organization);
  List<Notification> findAllByOrganizationOrderByCreatedAtDesc(Organization organization);
  List<Notification> findAllByOrganizationAndReadFlagFalse(Organization organization);
  List<Notification> findByUserOrderByCreatedAtDesc(AppUser user);
  long countByOrganization(Organization organization);
  long countByOrganizationAndReadFlagFalse(Organization organization);
}
