package com.hms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdatePatientProfileRequest {

    @Size(max = 15, message = "Phone cannot exceed 15 characters")
    private String phone;

    private LocalDate dateOfBirth;

    @Size(max = 10)
    private String gender;

    @Size(max = 5)
    private String bloodGroup;

    private String address;

    @Size(max = 15)
    private String emergencyContact;

    @Size(max = 100)
    private String emergencyContactName;

    private String medicalHistory;

    private String allergies;
}
