package com.hms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateDoctorRequest {

    @Size(max = 100)
    private String specialization;

    @Min(value = 0)
    private Integer experienceYears;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal consultationFee;

    private String bio;

    private String availableDays;

    private String availableTimeStart;

    private String availableTimeEnd;

    private String qualification;

    private Boolean isAvailable;

    @Size(max = 15)
    private String phone;
}
