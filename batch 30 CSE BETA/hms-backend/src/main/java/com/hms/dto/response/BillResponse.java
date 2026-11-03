package com.hms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hms.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BillResponse {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private String invoiceNumber;
    private BigDecimal consultationFee;
    private BigDecimal medicineCharges;
    private BigDecimal additionalCharges;
    private BigDecimal discount;
    private BigDecimal gstPercentage;
    private BigDecimal gstAmount;
    private BigDecimal grandTotal;
    private PaymentStatus paymentStatus;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String notes;
    private List<BillItemResponse> items;
    private LocalDateTime createdAt;
}
