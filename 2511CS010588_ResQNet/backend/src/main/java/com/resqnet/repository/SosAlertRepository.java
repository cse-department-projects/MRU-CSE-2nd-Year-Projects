package com.resqnet.repository;

import com.resqnet.entity.SosAlert;
import com.resqnet.enums.SosStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SosAlertRepository extends JpaRepository<SosAlert, Long> {
    List<SosAlert> findAllByOrderByCreatedAtDesc();
    List<SosAlert> findByStatusInOrderByCreatedAtDesc(List<SosStatus> statuses);
    Optional<SosAlert> findFirstByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<SosStatus> statuses);
    List<SosAlert> findByAssignedTeamIdAndStatusInOrderByCreatedAtDesc(Long teamId, List<SosStatus> statuses);
    long countByAssignedTeamIdAndStatusIn(Long teamId, List<SosStatus> statuses);
    List<SosAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
}
