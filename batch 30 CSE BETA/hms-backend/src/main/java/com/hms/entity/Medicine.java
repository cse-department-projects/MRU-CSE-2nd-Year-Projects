package com.hms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "medicines", indexes = {
    @Index(name = "idx_medicines_name", columnList = "name"),
    @Index(name = "idx_medicines_category", columnList = "category"),
    @Index(name = "idx_medicines_batch", columnList = "batchNumber")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 200)
    private String genericName;

    @Column(length = 200)
    private String manufacturer;

    @Column(length = 100)
    private String batchNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    private LocalDate expiryDate;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String dosageForm; // Tablet, Capsule, Syrup, Injection

    @Column(length = 50)
    private String strength;

    @Builder.Default
    private Integer lowStockThreshold = 10;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToMany(mappedBy = "medicine", fetch = FetchType.LAZY)
    private List<PrescriptionItem> prescriptionItems;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
