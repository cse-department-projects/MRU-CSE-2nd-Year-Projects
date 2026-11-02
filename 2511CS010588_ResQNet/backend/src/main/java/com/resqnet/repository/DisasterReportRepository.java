package com.resqnet.repository;

import com.resqnet.entity.DisasterReport;
import com.resqnet.enums.DisasterStatus;
import com.resqnet.enums.DisasterType;
import com.resqnet.enums.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisasterReportRepository extends JpaRepository<DisasterReport, Long> {
    List<DisasterReport> findAllByOrderByCreatedAtDesc();
    List<DisasterReport> findByReporterIdOrderByCreatedAtDesc(Long reporterId);
    List<DisasterReport> findByStatusOrderByCreatedAtDesc(DisasterStatus status);
    List<DisasterReport> findByDisasterTypeOrderByCreatedAtDesc(DisasterType disasterType);
    List<DisasterReport> findBySeverityOrderByCreatedAtDesc(Severity severity);
}
