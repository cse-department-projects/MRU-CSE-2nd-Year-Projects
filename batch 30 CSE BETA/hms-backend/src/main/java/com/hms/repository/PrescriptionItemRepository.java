package com.hms.repository;

import com.hms.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {

    // Top consumed medicines globally (for pharmacist analytics)
    @Query("SELECT pi.medicine.name, SUM(pi.quantity) FROM PrescriptionItem pi " +
           "WHERE pi.quantity IS NOT NULL GROUP BY pi.medicine.name ORDER BY SUM(pi.quantity) DESC")
    List<Object[]> getTopConsumedMedicines();

    // Top prescribed medicines by a specific doctor (for doctor analytics)
    @Query("SELECT pi.medicine.name, COUNT(pi) FROM PrescriptionItem pi " +
           "WHERE pi.prescription.doctor.id = :doctorId GROUP BY pi.medicine.name ORDER BY COUNT(pi) DESC")
    List<Object[]> getTopPrescribedMedicinesByDoctor(@Param("doctorId") Long doctorId);

    // Top medicines prescribed to a specific patient (for patient analytics)
    @Query("SELECT pi.medicine.name, COUNT(pi) FROM PrescriptionItem pi " +
           "WHERE pi.prescription.patient.id = :patientId GROUP BY pi.medicine.name ORDER BY COUNT(pi) DESC")
    List<Object[]> getTopPrescribedMedicinesForPatient(@Param("patientId") Long patientId);

    // Top diagnoses for a specific doctor
    @Query("SELECT p.diagnosis, COUNT(p) FROM Prescription p " +
           "WHERE p.doctor.id = :doctorId AND p.diagnosis IS NOT NULL AND p.diagnosis <> '' " +
           "GROUP BY p.diagnosis ORDER BY COUNT(p) DESC")
    List<Object[]> getTopDiagnosesByDoctor(@Param("doctorId") Long doctorId);
}
