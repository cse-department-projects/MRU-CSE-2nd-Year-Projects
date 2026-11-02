package com.logilink.repository;

import com.logilink.entity.AppUser;
import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  @EntityGraph(attributePaths = {"organization"})
  Optional<AppUser> findByEmail(String email);

  boolean existsByEmail(String email);

  @EntityGraph(attributePaths = {"organization"})
  List<AppUser> findAllByOrganization(Organization organization);

  @EntityGraph(attributePaths = {"organization"})
  Optional<AppUser> findByIdAndOrganization(Long id, Organization organization);
}
