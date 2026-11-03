package com.hms.service;

import com.hms.dto.request.MedicineRequest;
import com.hms.dto.response.MedicineResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.Medicine;
import com.hms.entity.User;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final AuditLogService auditLogService;

    public MedicineResponse createMedicine(MedicineRequest request, User createdBy) {
        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .genericName(request.getGenericName())
                .manufacturer(request.getManufacturer())
                .batchNumber(request.getBatchNumber())
                .quantity(request.getQuantity())
                .expiryDate(request.getExpiryDate())
                .price(request.getPrice())
                .category(request.getCategory())
                .description(request.getDescription())
                .dosageForm(request.getDosageForm())
                .strength(request.getStrength())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .isActive(true)
                .build();

        medicine = medicineRepository.save(medicine);
        auditLogService.log(createdBy, "CREATE_MEDICINE", "MEDICINE", medicine.getId(),
                "Medicine created: " + medicine.getName());
        return mapToResponse(medicine);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MedicineResponse> getAllMedicines(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Medicine> medicines;

        if (search != null && !search.isBlank()) {
            medicines = medicineRepository.searchMedicines(search, pageable);
        } else {
            medicines = medicineRepository.findByIsActiveTrue(pageable);
        }

        return toPagedResponse(medicines);
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        return mapToResponse(medicine);
    }

    public MedicineResponse updateMedicine(Long id, MedicineRequest request, User updatedBy) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));

        medicine.setName(request.getName());
        if (request.getGenericName() != null) medicine.setGenericName(request.getGenericName());
        if (request.getManufacturer() != null) medicine.setManufacturer(request.getManufacturer());
        if (request.getBatchNumber() != null) medicine.setBatchNumber(request.getBatchNumber());
        medicine.setQuantity(request.getQuantity());
        if (request.getExpiryDate() != null) medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPrice(request.getPrice());
        if (request.getCategory() != null) medicine.setCategory(request.getCategory());
        if (request.getDescription() != null) medicine.setDescription(request.getDescription());
        if (request.getDosageForm() != null) medicine.setDosageForm(request.getDosageForm());
        if (request.getStrength() != null) medicine.setStrength(request.getStrength());
        if (request.getLowStockThreshold() != null) medicine.setLowStockThreshold(request.getLowStockThreshold());

        medicine = medicineRepository.save(medicine);
        auditLogService.log(updatedBy, "UPDATE_MEDICINE", "MEDICINE", id, "Medicine updated: " + medicine.getName());
        return mapToResponse(medicine);
    }

    public void updateStock(Long id, int quantityChange, User updatedBy) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        int newQty = medicine.getQuantity() + quantityChange;
        if (newQty < 0) {
            throw new com.hms.exception.InsufficientStockException(
                    "Insufficient stock for medicine: " + medicine.getName());
        }
        medicine.setQuantity(newQty);
        medicineRepository.save(medicine);
        auditLogService.log(updatedBy, "UPDATE_STOCK", "MEDICINE", id,
                "Stock updated for " + medicine.getName() + " by " + quantityChange);
    }

    public void deleteMedicine(Long id, User deletedBy) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        medicine.setActive(false);
        medicineRepository.save(medicine);
        auditLogService.log(deletedBy, "DELETE_MEDICINE", "MEDICINE", id,
                "Medicine deactivated: " + medicine.getName());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getLowStockMedicines() {
        return medicineRepository.findLowStockMedicines().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getExpiringMedicines() {
        LocalDate today = LocalDate.now();
        return medicineRepository.findExpiringMedicines(today, today.plusDays(30)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return medicineRepository.findAllCategories();
    }

    public MedicineResponse mapToResponse(Medicine medicine) {
        LocalDate today = LocalDate.now();
        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .manufacturer(medicine.getManufacturer())
                .batchNumber(medicine.getBatchNumber())
                .quantity(medicine.getQuantity())
                .expiryDate(medicine.getExpiryDate())
                .price(medicine.getPrice())
                .category(medicine.getCategory())
                .description(medicine.getDescription())
                .dosageForm(medicine.getDosageForm())
                .strength(medicine.getStrength())
                .lowStockThreshold(medicine.getLowStockThreshold())
                .isActive(medicine.isActive())
                .isLowStock(medicine.getQuantity() <= medicine.getLowStockThreshold())
                .isExpired(medicine.getExpiryDate() != null && medicine.getExpiryDate().isBefore(today))
                .createdAt(medicine.getCreatedAt())
                .build();
    }

    private PagedResponse<MedicineResponse> toPagedResponse(Page<Medicine> page) {
        List<MedicineResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PagedResponse.<MedicineResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
