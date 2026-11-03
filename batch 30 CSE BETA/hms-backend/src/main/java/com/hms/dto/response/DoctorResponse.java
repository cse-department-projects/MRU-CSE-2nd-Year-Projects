package com.hms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorResponse {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private String specialization;
    private String licenseNumber;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private String bio;
    private String availableDays;
    private String availableTimeStart;
    private String availableTimeEnd;
    private String qualification;
    private boolean isAvailable;
    private boolean isActive;
    private LocalDateTime createdAt;
}
