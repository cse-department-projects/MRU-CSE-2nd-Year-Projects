package com.hms.repository;

import com.hms.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByAppointmentId(Long appointmentId);

    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);

    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId ORDER BY p.createdAt DESC")
    List<Prescription> findAllByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);

    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.doctor.id = :doctorId")
    long countByDoctorId(@Param("doctorId") Long doctorId);
}
