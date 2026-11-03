package com.hms.repository;

import com.hms.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Query("SELECT p FROM Patient p JOIN p.user u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Patient p JOIN p.user u WHERE p.bloodGroup = :bloodGroup")
    Page<Patient> findByBloodGroup(@Param("bloodGroup") String bloodGroup, Pageable pageable);

    long count();

    // ========== Analytics Queries ==========

    @Query("SELECT YEAR(p.createdAt), MONTH(p.createdAt), COUNT(p) " +
           "FROM Patient p WHERE p.createdAt BETWEEN :start AND :end " +
           "GROUP BY YEAR(p.createdAt), MONTH(p.createdAt) " +
           "ORDER BY YEAR(p.createdAt), MONTH(p.createdAt)")
    List<Object[]> getMonthlyPatientRegistrations(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT p.gender, COUNT(p) FROM Patient p WHERE p.gender IS NOT NULL GROUP BY p.gender")
    List<Object[]> getGenderDistribution();

    @Query("SELECT p.bloodGroup, COUNT(p) FROM Patient p WHERE p.bloodGroup IS NOT NULL GROUP BY p.bloodGroup ORDER BY COUNT(p) DESC")
    List<Object[]> getBloodGroupDistribution();

    @Query("SELECT CASE " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) < 18 THEN '0-17' " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) BETWEEN 18 AND 30 THEN '18-30' " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) BETWEEN 31 AND 50 THEN '31-50' " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) BETWEEN 51 AND 65 THEN '51-65' " +
           "ELSE '65+' END, COUNT(p) " +
           "FROM Patient p WHERE p.dateOfBirth IS NOT NULL GROUP BY " +
           "CASE " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) < 18 THEN '0-17' " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) BETWEEN 18 AND 30 THEN '18-30' " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) BETWEEN 31 AND 50 THEN '31-50' " +
           "WHEN TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURRENT_DATE) BETWEEN 51 AND 65 THEN '51-65' " +
           "ELSE '65+' END")
    List<Object[]> getAgeGroupDistribution();
}
