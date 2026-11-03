package com.hms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedicineResponse {
    private Long id;
    private String name;
    private String genericName;
    private String manufacturer;
    private String batchNumber;
    private Integer quantity;
    private LocalDate expiryDate;
    private BigDecimal price;
    private String category;
    private String description;
    private String dosageForm;
    private String strength;
    private Integer lowStockThreshold;
    private boolean isActive;
    private boolean isLowStock;
    private boolean isExpired;
    private LocalDateTime createdAt;
}
