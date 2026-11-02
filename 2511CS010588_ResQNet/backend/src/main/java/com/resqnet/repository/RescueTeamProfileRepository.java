package com.resqnet.repository;

import com.resqnet.entity.RescueTeamProfile;
import com.resqnet.enums.OperationalStatus;
import com.resqnet.enums.TeamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RescueTeamProfileRepository extends JpaRepository<RescueTeamProfile, Long> {
    Optional<RescueTeamProfile> findByUserId(Long userId);
    List<RescueTeamProfile> findByOperationalStatus(OperationalStatus status);
    List<RescueTeamProfile> findByTeamType(TeamType teamType);
}
