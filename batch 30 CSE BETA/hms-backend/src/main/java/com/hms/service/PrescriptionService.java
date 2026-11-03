package com.hms.service;

import com.hms.dto.request.CreatePrescriptionRequest;
import com.hms.dto.response.PagedResponse;
import com.hms.dto.response.PrescriptionItemResponse;
import com.hms.dto.response.PrescriptionResponse;
import com.hms.entity.*;
import com.hms.exception.DuplicateResourceException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final MedicineRepository medicineRepository;
    private final AuditLogService auditLogService;

    public PrescriptionResponse createPrescription(CreatePrescriptionRequest request, User doctorUser) {
        if (prescriptionRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new DuplicateResourceException("Prescription already exists for this appointment");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .doctor(doctor)
                .patient(appointment.getPatient())
                .diagnosis(request.getDiagnosis())
                .notes(request.getNotes())
                .followUpInstructions(request.getFollowUpInstructions())
                .items(new ArrayList<>())
                .build();

        prescription = prescriptionRepository.save(prescription);

        // Create prescription items
        final Prescription finalPrescription = prescription;
        List<PrescriptionItem> items = request.getItems().stream().map(itemReq -> {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", itemReq.getMedicineId()));
            return PrescriptionItem.builder()
                    .prescription(finalPrescription)
                    .medicine(medicine)
                    .dosage(itemReq.getDosage())
                    .frequency(itemReq.getFrequency())
                    .duration(itemReq.getDuration())
                    .instructions(itemReq.getInstructions())
                    .quantity(itemReq.getQuantity())
                    .build();
        }).collect(Collectors.toList());

        prescription.setItems(items);
        prescription = prescriptionRepository.save(prescription);

        // Mark appointment as completed
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        auditLogService.log(doctorUser, "CREATE_PRESCRIPTION", "PRESCRIPTION", prescription.getId(),
                "Prescription created for patient: " + appointment.getPatient().getUser().getFullName());

        return mapToResponse(prescription);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId) {
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found for appointment: " + appointmentId));
        return mapToResponse(prescription);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PrescriptionResponse> getPatientPrescriptions(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId, pageable);
        return toPagedResponse(prescriptions);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PrescriptionResponse> getDoctorPrescriptions(Long doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Prescription> prescriptions = prescriptionRepository.findByDoctorId(doctorId, pageable);
        return toPagedResponse(prescriptions);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        return mapToResponse(prescription);
    }

    public PrescriptionResponse mapToResponse(Prescription prescription) {
        List<PrescriptionItemResponse> itemResponses = prescription.getItems() == null ?
                List.of() :
                prescription.getItems().stream().map(item -> {
                    Medicine medicine = item.getMedicine();
                    return PrescriptionItemResponse.builder()
                            .id(item.getId())
                            .medicineId(medicine.getId())
                            .medicineName(medicine.getName())
                            .genericName(medicine.getGenericName())
                            .dosageForm(medicine.getDosageForm())
                            .strength(medicine.getStrength())
                            .dosage(item.getDosage())
                            .frequency(item.getFrequency())
                            .duration(item.getDuration())
                            .instructions(item.getInstructions())
                            .quantity(item.getQuantity())
                            .build();
                }).collect(Collectors.toList());

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .appointmentId(prescription.getAppointment().getId())
                .doctorId(prescription.getDoctor().getId())
                .doctorName(prescription.getDoctor().getUser().getFullName())
                .doctorSpecialization(prescription.getDoctor().getSpecialization())
                .patientId(prescription.getPatient().getId())
                .patientName(prescription.getPatient().getUser().getFullName())
                .diagnosis(prescription.getDiagnosis())
                .notes(prescription.getNotes())
                .followUpInstructions(prescription.getFollowUpInstructions())
                .items(itemResponses)
                .createdAt(prescription.getCreatedAt())
                .build();
    }

    private PagedResponse<PrescriptionResponse> toPagedResponse(Page<Prescription> page) {
        List<PrescriptionResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PagedResponse.<PrescriptionResponse>builder()
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
