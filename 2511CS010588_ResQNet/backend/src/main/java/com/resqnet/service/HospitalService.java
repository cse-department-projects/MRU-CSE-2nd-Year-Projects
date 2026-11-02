package com.resqnet.service;

import com.resqnet.dto.hospital.CreateHospitalRequest;
import com.resqnet.dto.hospital.HospitalResponse;
import com.resqnet.dto.hospital.UpdateBedsRequest;
import com.resqnet.enums.HospitalStatus;

import java.util.List;

public interface HospitalService {
    HospitalResponse createHospital(CreateHospitalRequest request);
    List<HospitalResponse> getAllHospitals(HospitalStatus status);
    HospitalResponse getHospitalById(Long id, Double userLat, Double userLon);
    List<HospitalResponse> getNearbyHospitals(Double lat, Double lon, Double radiusKm);
    HospitalResponse updateBeds(Long id, UpdateBedsRequest request);
    HospitalResponse updateStatus(Long id, HospitalStatus status);
}
