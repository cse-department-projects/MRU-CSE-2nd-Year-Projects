package com.resqnet.repository;

import com.resqnet.entity.CitizenProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CitizenProfileRepository extends JpaRepository<CitizenProfile, Long> {
    Optional<CitizenProfile> findByUserId(Long userId);
}
