package com.citywatch.repository;

import com.citywatch.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AuthorityProfileRepository extends JpaRepository<AuthorityProfile, Long> {
    Optional<AuthorityProfile> findByUserId(Long userId);
    List<AuthorityProfile> findByDepartment(Department department);
}
