package com.hms.service;

import com.hms.dto.request.CreateDoctorRequest;
import com.hms.dto.request.UpdateDoctorRequest;
import com.hms.dto.response.DoctorResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.Doctor;
import com.hms.entity.Role;
import com.hms.entity.User;
import com.hms.exception.DuplicateResourceException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public DoctorResponse createDoctor(CreateDoctorRequest request, User adminUser) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("License number '" + request.getLicenseNumber() + "' is already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.DOCTOR)
                .isActive(true)
                .emailVerified(true)
                .build();
        user = userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .licenseNumber(request.getLicenseNumber())
                .experienceYears(request.getExperienceYears())
                .consultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : BigDecimal.ZERO)
                .bio(request.getBio())
                .availableDays(request.getAvailableDays())
                .availableTimeStart(request.getAvailableTimeStart() != null ?
                        LocalTime.parse(request.getAvailableTimeStart()) : null)
                .availableTimeEnd(request.getAvailableTimeEnd() != null ?
                        LocalTime.parse(request.getAvailableTimeEnd()) : null)
                .qualification(request.getQualification())
                .isAvailable(true)
                .build();

        doctor = doctorRepository.save(doctor);
        auditLogService.log(adminUser, "CREATE_DOCTOR", "DOCTOR", doctor.getId(),
                "Doctor created: " + user.getFullName());

        return mapToResponse(doctor);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DoctorResponse> getAllDoctors(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("user.firstName").ascending());
        Page<Doctor> doctors;

        if (search != null && !search.isBlank()) {
            doctors = doctorRepository.searchDoctors(search, pageable);
        } else {
            doctors = doctorRepository.findAll(pageable);
        }

        return toPagedResponse(doctors);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return mapToResponse(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user"));
        return mapToResponse(doctor);
    }

    public DoctorResponse updateDoctor(Long id, UpdateDoctorRequest request, User updatedBy) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getExperienceYears() != null) doctor.setExperienceYears(request.getExperienceYears());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getBio() != null) doctor.setBio(request.getBio());
        if (request.getAvailableDays() != null) doctor.setAvailableDays(request.getAvailableDays());
        if (request.getAvailableTimeStart() != null) doctor.setAvailableTimeStart(LocalTime.parse(request.getAvailableTimeStart()));
        if (request.getAvailableTimeEnd() != null) doctor.setAvailableTimeEnd(LocalTime.parse(request.getAvailableTimeEnd()));
        if (request.getQualification() != null) doctor.setQualification(request.getQualification());
        if (request.getIsAvailable() != null) doctor.setAvailable(request.getIsAvailable());

        if (request.getPhone() != null) {
            doctor.getUser().setPhone(request.getPhone());
            userRepository.save(doctor.getUser());
        }

        doctor = doctorRepository.save(doctor);
        auditLogService.log(updatedBy, "UPDATE_DOCTOR", "DOCTOR", id, "Doctor updated: " + doctor.getUser().getFullName());
        return mapToResponse(doctor);
    }

    public void deleteDoctor(Long id, User deletedBy) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        User user = doctor.getUser();
        user.setActive(false);
        userRepository.save(user);
        auditLogService.log(deletedBy, "DELETE_DOCTOR", "DOCTOR", id, "Doctor deactivated: " + user.getFullName());
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getAvailableDoctors() {
        return doctorRepository.findAllAvailableDoctors().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllSpecializations() {
        return doctorRepository.findAllSpecializations();
    }

    public DoctorResponse mapToResponse(Doctor doctor) {
        User user = doctor.getUser();
        return DoctorResponse.builder()
                .id(doctor.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .availableDays(doctor.getAvailableDays())
                .availableTimeStart(doctor.getAvailableTimeStart() != null ? doctor.getAvailableTimeStart().toString() : null)
                .availableTimeEnd(doctor.getAvailableTimeEnd() != null ? doctor.getAvailableTimeEnd().toString() : null)
                .qualification(doctor.getQualification())
                .isAvailable(doctor.isAvailable())
                .isActive(user.isActive())
                .createdAt(doctor.getCreatedAt())
                .build();
    }

    private PagedResponse<DoctorResponse> toPagedResponse(Page<Doctor> page) {
        List<DoctorResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PagedResponse.<DoctorResponse>builder()
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
