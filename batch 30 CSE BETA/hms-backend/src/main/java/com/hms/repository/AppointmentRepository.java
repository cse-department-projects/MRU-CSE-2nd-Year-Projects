package com.hms.repository;

import com.hms.entity.Appointment;
import com.hms.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status, Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    List<Appointment> findByPatientIdAndAppointmentDate(Long patientId, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.appointmentTime = :time AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    List<Appointment> findConflictingAppointments(@Param("doctorId") Long doctorId, @Param("date") LocalDate date, @Param("time") LocalTime time);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :today AND a.status IN ('PENDING', 'CONFIRMED')")
    List<Appointment> findTodaysAppointments(@Param("today") LocalDate today);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :today AND a.status IN ('PENDING', 'CONFIRMED') ORDER BY a.appointmentTime")
    List<Appointment> findTodaysAppointmentsForDoctor(@Param("doctorId") Long doctorId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :today")
    long countTodaysAppointments(@Param("today") LocalDate today);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :today")
    long countTodaysAppointmentsForDoctor(@Param("doctorId") Long doctorId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
    long countByDoctorIdAndStatus(@Param("doctorId") Long doctorId, @Param("status") AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patient.id = :patientId")
    long countByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate >= :fromDate AND a.status NOT IN ('CANCELLED', 'NO_SHOW') ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findUpcomingAppointmentsForDoctor(@Param("doctorId") Long doctorId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate >= :fromDate ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findUpcomingForPatient(@Param("patientId") Long patientId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT COUNT(a) FROM Appointment a")
    long countAllAppointments();

    @Query("SELECT a FROM Appointment a WHERE a.status = :status AND a.appointmentDate BETWEEN :startDate AND :endDate")
    Page<Appointment> findByStatusAndDateRange(@Param("status") AppointmentStatus status, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    // ========== Analytics Queries ==========

    @Query("SELECT YEAR(a.appointmentDate), MONTH(a.appointmentDate), COUNT(a) " +
           "FROM Appointment a WHERE a.appointmentDate BETWEEN :start AND :end " +
           "GROUP BY YEAR(a.appointmentDate), MONTH(a.appointmentDate) " +
           "ORDER BY YEAR(a.appointmentDate), MONTH(a.appointmentDate)")
    List<Object[]> getMonthlyAppointmentCounts(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Appointment a GROUP BY a.status")
    List<Object[]> getAppointmentStatusDistribution();

    @Query("SELECT DAYOFWEEK(a.appointmentDate), COUNT(a) FROM Appointment a " +
           "WHERE a.appointmentDate BETWEEN :start AND :end GROUP BY DAYOFWEEK(a.appointmentDate)")
    List<Object[]> getAppointmentsByDayOfWeek(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT d.specialization, COUNT(a) FROM Appointment a JOIN a.doctor d GROUP BY d.specialization ORDER BY COUNT(a) DESC")
    List<Object[]> getAppointmentsByDepartment();

    @Query("SELECT CONCAT(u.firstName, ' ', u.lastName), COUNT(a) " +
           "FROM Appointment a JOIN a.doctor d JOIN d.user u " +
           "WHERE a.status = 'COMPLETED' GROUP BY d.id, u.firstName, u.lastName ORDER BY COUNT(a) DESC")
    List<Object[]> getTopDoctorsByCompletedAppointments();

    // Doctor-specific analytics
    @Query("SELECT YEAR(a.appointmentDate), MONTH(a.appointmentDate), COUNT(a) " +
           "FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :start AND :end " +
           "GROUP BY YEAR(a.appointmentDate), MONTH(a.appointmentDate) " +
           "ORDER BY YEAR(a.appointmentDate), MONTH(a.appointmentDate)")
    List<Object[]> getMonthlyAppointmentCountsForDoctor(@Param("doctorId") Long doctorId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId GROUP BY a.status")
    List<Object[]> getAppointmentStatusDistributionForDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT DAYOFWEEK(a.appointmentDate), COUNT(a) FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :start AND :end " +
           "GROUP BY DAYOFWEEK(a.appointmentDate)")
    List<Object[]> getAppointmentsByDayOfWeekForDoctor(@Param("doctorId") Long doctorId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(DISTINCT a.patient.id) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = 'COMPLETED'")
    long countDistinctPatientsServedByDoctor(@Param("doctorId") Long doctorId);

    // Patient-specific analytics
    @Query("SELECT YEAR(a.appointmentDate), MONTH(a.appointmentDate), COUNT(a) " +
           "FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate BETWEEN :start AND :end " +
           "GROUP BY YEAR(a.appointmentDate), MONTH(a.appointmentDate) " +
           "ORDER BY YEAR(a.appointmentDate), MONTH(a.appointmentDate)")
    List<Object[]> getMonthlyAppointmentCountsForPatient(@Param("patientId") Long patientId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.patient.id = :patientId GROUP BY a.status")
    List<Object[]> getAppointmentStatusDistributionForPatient(@Param("patientId") Long patientId);
}
