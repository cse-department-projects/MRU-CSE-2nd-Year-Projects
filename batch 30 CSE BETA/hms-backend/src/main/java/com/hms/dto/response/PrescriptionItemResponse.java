package com.hms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String genericName;
    private String dosageForm;
    private String strength;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    private Integer quantity;
}
