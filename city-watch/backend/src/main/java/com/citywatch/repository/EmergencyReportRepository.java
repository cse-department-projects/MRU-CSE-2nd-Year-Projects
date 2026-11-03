package com.citywatch.repository;

import com.citywatch.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface EmergencyReportRepository extends JpaRepository<EmergencyReport, Long> {
    List<EmergencyReport> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<EmergencyReport> findByDepartmentOrderByCreatedAtDesc(Department department);
    long countByDepartmentAndStatusNot(Department department, ReportStatus status);
}
