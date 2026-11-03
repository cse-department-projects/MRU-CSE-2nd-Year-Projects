package com.hms.repository;

import com.hms.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Page<Medicine> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Medicine> searchMedicines(@Param("search") String search, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND m.quantity <= m.lowStockThreshold")
    List<Medicine> findLowStockMedicines();

    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND m.expiryDate < :date")
    List<Medicine> findExpiredMedicines(@Param("date") LocalDate date);

    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND m.expiryDate BETWEEN :today AND :thirtyDaysLater")
    List<Medicine> findExpiringMedicines(@Param("today") LocalDate today, @Param("thirtyDaysLater") LocalDate thirtyDaysLater);

    Page<Medicine> findByCategoryIgnoreCase(String category, Pageable pageable);

    @Query("SELECT DISTINCT m.category FROM Medicine m WHERE m.isActive = true ORDER BY m.category")
    List<String> findAllCategories();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.isActive = true AND m.quantity <= m.lowStockThreshold")
    long countLowStockMedicines();

    long countByIsActiveTrue();

    // ========== Analytics Queries ==========

    @Query("SELECT m.category, COUNT(m) FROM Medicine m WHERE m.isActive = true AND m.category IS NOT NULL GROUP BY m.category ORDER BY COUNT(m) DESC")
    List<Object[]> getCategoryDistribution();

    @Query("SELECT m.category, SUM(m.quantity * m.price) FROM Medicine m WHERE m.isActive = true AND m.category IS NOT NULL GROUP BY m.category ORDER BY SUM(m.quantity * m.price) DESC")
    List<Object[]> getStockValueByCategory();

    @Query("SELECT m.dosageForm, COUNT(m) FROM Medicine m WHERE m.isActive = true AND m.dosageForm IS NOT NULL GROUP BY m.dosageForm")
    List<Object[]> getDosageFormDistribution();

    @Query("SELECT SUM(m.quantity * m.price) FROM Medicine m WHERE m.isActive = true")
    java.math.BigDecimal getTotalInventoryValue();

    @Query("SELECT CASE " +
           "WHEN m.expiryDate <= :today THEN 'Expired' " +
           "WHEN m.expiryDate BETWEEN :today AND :thirtyDays THEN '0-30 days' " +
           "WHEN m.expiryDate BETWEEN :thirtyDays AND :sixtyDays THEN '30-60 days' " +
           "WHEN m.expiryDate BETWEEN :sixtyDays AND :ninetyDays THEN '60-90 days' " +
           "ELSE 'Safe' END, COUNT(m) " +
           "FROM Medicine m WHERE m.isActive = true AND m.expiryDate IS NOT NULL " +
           "GROUP BY CASE " +
           "WHEN m.expiryDate <= :today THEN 'Expired' " +
           "WHEN m.expiryDate BETWEEN :today AND :thirtyDays THEN '0-30 days' " +
           "WHEN m.expiryDate BETWEEN :thirtyDays AND :sixtyDays THEN '30-60 days' " +
           "WHEN m.expiryDate BETWEEN :sixtyDays AND :ninetyDays THEN '60-90 days' " +
           "ELSE 'Safe' END")
    List<Object[]> getExpiryForecast(@Param("today") LocalDate today, @Param("thirtyDays") LocalDate thirtyDays, @Param("sixtyDays") LocalDate sixtyDays, @Param("ninetyDays") LocalDate ninetyDays);
}
