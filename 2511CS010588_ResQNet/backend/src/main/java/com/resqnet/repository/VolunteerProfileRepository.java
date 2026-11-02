package com.resqnet.repository;

import com.resqnet.entity.VolunteerProfile;
import com.resqnet.enums.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, Long> {
    Optional<VolunteerProfile> findByUserId(Long userId);
    List<VolunteerProfile> findByAvailabilityStatus(AvailabilityStatus status);
    List<VolunteerProfile> findAllByOrderByTotalPointsDesc();
}

