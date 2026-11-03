package com.hms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class GenerateBillRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
    private BigDecimal consultationFee;

    @DecimalMin(value = "0.0", message = "Medicine charges cannot be negative")
    private BigDecimal medicineCharges;

    @DecimalMin(value = "0.0", message = "Additional charges cannot be negative")
    private BigDecimal additionalCharges;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    @DecimalMax(value = "100.0", message = "Discount cannot exceed 100%")
    private BigDecimal discount;

    @DecimalMin(value = "0.0", message = "GST cannot be negative")
    private BigDecimal gstPercentage;

    private String notes;

    private String paymentMethod;

    private List<BillItemRequest> items;

    @Data
    public static class BillItemRequest {
        @NotBlank(message = "Item description is required")
        private String description;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.0", message = "Unit price cannot be negative")
        private BigDecimal unitPrice;
    }
}
