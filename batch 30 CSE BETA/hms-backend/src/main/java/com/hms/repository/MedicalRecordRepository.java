package com.hms.repository;

import com.hms.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);

    Page<MedicalRecord> findByPatientId(Long patientId, Pageable pageable);

    Page<MedicalRecord> findByDoctorId(Long doctorId, Pageable pageable);

    @Query("SELECT m FROM MedicalRecord m WHERE m.patient.id = :patientId ORDER BY m.visitDate DESC")
    List<MedicalRecord> findAllByPatientIdOrderByVisitDateDesc(@Param("patientId") Long patientId);

    @Query("SELECT m FROM MedicalRecord m WHERE m.doctor.id = :doctorId ORDER BY m.visitDate DESC")
    Page<MedicalRecord> findByDoctorIdOrderByVisitDateDesc(@Param("doctorId") Long doctorId, Pageable pageable);
}
