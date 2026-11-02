package com.resqnet.service.impl;

import com.resqnet.dto.hospital.CreateHospitalRequest;
import com.resqnet.dto.hospital.HospitalResponse;
import com.resqnet.dto.hospital.UpdateBedsRequest;
import com.resqnet.entity.Hospital;
import com.resqnet.enums.HospitalStatus;
import com.resqnet.exception.BadRequestException;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.HospitalRepository;
import com.resqnet.service.HospitalService;
import com.resqnet.util.GeoUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalServiceImpl(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    @Override
    @Transactional
    public HospitalResponse createHospital(CreateHospitalRequest request) {
        Hospital hospital = new Hospital();
        hospital.setName(request.getName().trim());
        hospital.setTotalBeds(request.getTotalBeds());
        hospital.setAvailableGeneralBeds(request.getAvailableGeneralBeds());
        hospital.setAvailableIcuBeds(request.getAvailableIcuBeds());
        hospital.setAvailableVentilators(request.getAvailableVentilators());
        hospital.setEmergencyPhone(request.getEmergencyPhone().trim());
        hospital.setLatitude(request.getLatitude());
        hospital.setLongitude(request.getLongitude());
        hospital.setAddress(request.getAddress().trim());
        hospital.setHasTraumaCenter(request.getHasTraumaCenter() != null ? request.getHasTraumaCenter() : true);
        hospital.setHasBloodBank(request.getHasBloodBank() != null ? request.getHasBloodBank() : true);
        hospital.setStatus(request.getStatus() != null ? request.getStatus() : HospitalStatus.OPERATIONAL);

        Hospital saved = hospitalRepository.save(hospital);
        return mapToResponse(saved, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HospitalResponse> getAllHospitals(HospitalStatus status) {
        List<Hospital> hospitals;
        if (status != null) {
            hospitals = hospitalRepository.findByStatus(status);
        } else {
            hospitals = hospitalRepository.findAllByOrderByCreatedAtDesc();
        }

        return hospitals.stream()
                .map(h -> mapToResponse(h, null, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HospitalResponse getHospitalById(Long id, Double userLat, Double userLon) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));

        return mapToResponse(hospital, userLat, userLon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HospitalResponse> getNearbyHospitals(Double lat, Double lon, Double radiusKm) {
        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 25.0;
        List<Hospital> hospitals = hospitalRepository.findAllByOrderByCreatedAtDesc();

        return hospitals.stream()
                .filter(h -> {
                    if (h.getLatitude() == null || h.getLongitude() == null) return false;
                    double dist = GeoUtils.calculateDistanceKm(lat, lon, h.getLatitude(), h.getLongitude());
                    return dist <= maxRadius;
                })
                .sorted(Comparator.comparingDouble(h ->
                        GeoUtils.calculateDistanceKm(lat, lon, h.getLatitude(), h.getLongitude())))
                .map(h -> mapToResponse(h, lat, lon))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HospitalResponse updateBeds(Long id, UpdateBedsRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));

        if (request.getAvailableGeneralBeds() != null) {
            if (request.getAvailableGeneralBeds() > hospital.getTotalBeds()) {
                throw new BadRequestException("Available general beds cannot exceed total beds");
            }
            hospital.setAvailableGeneralBeds(request.getAvailableGeneralBeds());
        }
        if (request.getAvailableIcuBeds() != null) {
            hospital.setAvailableIcuBeds(request.getAvailableIcuBeds());
        }
        if (request.getAvailableVentilators() != null) {
            hospital.setAvailableVentilators(request.getAvailableVentilators());
        }
        if (request.getStatus() != null) {
            hospital.setStatus(request.getStatus());
        }

        // Auto-detect capacity status
        int totalAvailable = hospital.getAvailableGeneralBeds()
                + hospital.getAvailableIcuBeds()
                + hospital.getAvailableVentilators();
        if (totalAvailable == 0 && hospital.getStatus() == HospitalStatus.OPERATIONAL) {
            hospital.setStatus(HospitalStatus.FULL);
        }

        Hospital updated = hospitalRepository.save(hospital);
        return mapToResponse(updated, null, null);
    }

    @Override
    @Transactional
    public HospitalResponse updateStatus(Long id, HospitalStatus status) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));

        hospital.setStatus(status);
        Hospital updated = hospitalRepository.save(hospital);
        return mapToResponse(updated, null, null);
    }

    private HospitalResponse mapToResponse(Hospital hospital, Double userLat, Double userLon) {
        HospitalResponse res = new HospitalResponse();
        res.setId(hospital.getId());
        res.setName(hospital.getName());
        res.setTotalBeds(hospital.getTotalBeds());
        res.setAvailableGeneralBeds(hospital.getAvailableGeneralBeds());
        res.setAvailableIcuBeds(hospital.getAvailableIcuBeds());
        res.setAvailableVentilators(hospital.getAvailableVentilators());
        res.setEmergencyPhone(hospital.getEmergencyPhone());
        res.setLatitude(hospital.getLatitude());
        res.setLongitude(hospital.getLongitude());
        res.setAddress(hospital.getAddress());
        res.setHasTraumaCenter(hospital.getHasTraumaCenter());
        res.setHasBloodBank(hospital.getHasBloodBank());
        res.setStatus(hospital.getStatus());

        if (userLat != null && userLon != null && hospital.getLatitude() != null && hospital.getLongitude() != null) {
            double dist = GeoUtils.calculateDistanceKm(userLat, userLon, hospital.getLatitude(), hospital.getLongitude());
            res.setDistanceKm(Math.round(dist * 100.0) / 100.0);
        }

        res.setUpdatedAt(hospital.getUpdatedAt());
        return res;
    }
}
