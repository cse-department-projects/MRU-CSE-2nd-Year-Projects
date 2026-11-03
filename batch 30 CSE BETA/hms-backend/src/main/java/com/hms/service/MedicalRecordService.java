package com.hms.service;

import com.hms.dto.request.CreateMedicalRecordRequest;
import com.hms.dto.response.MedicalRecordResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.*;
import com.hms.exception.DuplicateResourceException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.MedicalRecordRepository;
import com.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AuditLogService auditLogService;

    public MedicalRecordResponse createMedicalRecord(CreateMedicalRecordRequest request, User doctorUser) {
        if (medicalRecordRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new DuplicateResourceException("Medical record already exists for this appointment");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        MedicalRecord record = MedicalRecord.builder()
                .patient(appointment.getPatient())
                .doctor(doctor)
                .appointment(appointment)
                .diagnosis(request.getDiagnosis())
                .treatment(request.getTreatment())
                .symptoms(request.getSymptoms())
                .reports(request.getReports())
                .doctorNotes(request.getDoctorNotes())
                .visitDate(request.getVisitDate())
                .followUpRequired(request.getFollowUpRequired())
                .build();

        record = medicalRecordRepository.save(record);
        auditLogService.log(doctorUser, "CREATE_MEDICAL_RECORD", "MEDICAL_RECORD", record.getId(),
                "Medical record created for patient: " + appointment.getPatient().getUser().getFullName());
        return mapToResponse(record);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MedicalRecordResponse> getPatientMedicalHistory(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("visitDate").descending());
        Page<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId, pageable);
        return toPagedResponse(records);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record", "id", id));
        return mapToResponse(record);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MedicalRecordResponse> getDoctorMedicalRecords(Long doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("visitDate").descending());
        Page<MedicalRecord> records = medicalRecordRepository.findByDoctorIdOrderByVisitDateDesc(doctorId, pageable);
        return toPagedResponse(records);
    }

    public MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getUser().getFullName())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getUser().getFullName())
                .doctorSpecialization(record.getDoctor().getSpecialization())
                .appointmentId(record.getAppointment().getId())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .symptoms(record.getSymptoms())
                .reports(record.getReports())
                .doctorNotes(record.getDoctorNotes())
                .visitDate(record.getVisitDate())
                .followUpRequired(record.getFollowUpRequired())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private PagedResponse<MedicalRecordResponse> toPagedResponse(Page<MedicalRecord> page) {
        List<MedicalRecordResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PagedResponse.<MedicalRecordResponse>builder()
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
