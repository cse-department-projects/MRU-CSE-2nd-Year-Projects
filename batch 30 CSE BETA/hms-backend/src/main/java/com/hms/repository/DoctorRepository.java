package com.hms.repository;

import com.hms.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByLicenseNumber(String licenseNumber);

    boolean existsByUserId(Long userId);

    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Doctor> searchDoctors(@Param("search") String search, Pageable pageable);

    Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);

    List<Doctor> findByIsAvailableTrue();

    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE d.isAvailable = true ORDER BY u.firstName")
    List<Doctor> findAllAvailableDoctors();

    @Query("SELECT d.specialization FROM Doctor d GROUP BY d.specialization ORDER BY d.specialization")
    List<String> findAllSpecializations();

    long count();
}
