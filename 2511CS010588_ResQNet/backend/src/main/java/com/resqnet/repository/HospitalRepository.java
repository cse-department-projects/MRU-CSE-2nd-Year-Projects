package com.resqnet.repository;

import com.resqnet.entity.Hospital;
import com.resqnet.enums.HospitalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findAllByOrderByCreatedAtDesc();
    List<Hospital> findByStatus(HospitalStatus status);
}
