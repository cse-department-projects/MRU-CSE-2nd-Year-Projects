package com.resqnet.repository;

import com.resqnet.entity.User;
import com.resqnet.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
    List<User> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);
    List<User> findByRoleAndIsActiveOrderByCreatedAtDesc(Role role, Boolean isActive);
    long countByRole(Role role);
    long countByIsActive(Boolean isActive);
}

