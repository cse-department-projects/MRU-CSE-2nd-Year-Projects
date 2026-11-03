package com.hms.repository;

import com.hms.entity.Bill;
import com.hms.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByInvoiceNumber(String invoiceNumber);

    Optional<Bill> findByAppointmentId(Long appointmentId);

    Page<Bill> findByPatientId(Long patientId, Pageable pageable);

    Page<Bill> findByPaymentStatus(PaymentStatus status, Pageable pageable);

    Page<Bill> findByPatientIdAndPaymentStatus(Long patientId, PaymentStatus status, Pageable pageable);

    @Query("SELECT SUM(b.grandTotal) FROM Bill b WHERE b.paymentStatus = 'PAID'")
    Optional<BigDecimal> getTotalRevenue();

    @Query("SELECT SUM(b.grandTotal) FROM Bill b WHERE b.paymentStatus = 'PAID' AND b.paymentDate BETWEEN :startDate AND :endDate")
    Optional<BigDecimal> getRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.paymentStatus = 'PENDING'")
    long countPendingBills();

    @Query("SELECT b FROM Bill b WHERE b.createdAt >= :fromDate ORDER BY b.createdAt DESC")
    List<Bill> findRecentBills(@Param("fromDate") java.time.LocalDateTime fromDate);

    @Query("SELECT SUM(b.grandTotal) FROM Bill b WHERE b.paymentStatus = 'PAID' AND YEAR(b.paymentDate) = :year AND MONTH(b.paymentDate) = :month")
    Optional<BigDecimal> getMonthlyRevenue(@Param("year") int year, @Param("month") int month);

    // ========== Analytics Queries ==========

    @Query("SELECT YEAR(b.paymentDate), MONTH(b.paymentDate), SUM(b.grandTotal) " +
           "FROM Bill b WHERE b.paymentStatus = 'PAID' AND b.paymentDate BETWEEN :start AND :end " +
           "GROUP BY YEAR(b.paymentDate), MONTH(b.paymentDate) " +
           "ORDER BY YEAR(b.paymentDate), MONTH(b.paymentDate)")
    List<Object[]> getMonthlyRevenueData(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT d.specialization, SUM(b.grandTotal) " +
           "FROM Bill b JOIN b.appointment a JOIN a.doctor d " +
           "WHERE b.paymentStatus = 'PAID' GROUP BY d.specialization ORDER BY SUM(b.grandTotal) DESC")
    List<Object[]> getRevenueBySpecialization();

    @Query("SELECT b.paymentStatus, COUNT(b) FROM Bill b GROUP BY b.paymentStatus")
    List<Object[]> getPaymentStatusDistribution();

    @Query("SELECT b.paymentMethod, COUNT(b) FROM Bill b WHERE b.paymentStatus = 'PAID' AND b.paymentMethod IS NOT NULL GROUP BY b.paymentMethod")
    List<Object[]> getPaymentMethodDistribution();

    // Patient-specific spending analytics
    @Query("SELECT YEAR(b.createdAt), MONTH(b.createdAt), SUM(b.grandTotal) " +
           "FROM Bill b WHERE b.patient.id = :patientId AND b.paymentStatus = 'PAID' " +
           "AND b.createdAt BETWEEN :start AND :end " +
           "GROUP BY YEAR(b.createdAt), MONTH(b.createdAt) " +
           "ORDER BY YEAR(b.createdAt), MONTH(b.createdAt)")
    List<Object[]> getMonthlySpendingForPatient(@Param("patientId") Long patientId, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT SUM(b.grandTotal) FROM Bill b WHERE b.patient.id = :patientId AND b.paymentStatus = 'PAID'")
    Optional<BigDecimal> getTotalSpentByPatient(@Param("patientId") Long patientId);
}
