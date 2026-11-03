package com.citywatch.repository;

import com.citywatch.entity.AppUser;
import com.citywatch.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    Optional<AppUser> findByUserCode(String userCode);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
}
