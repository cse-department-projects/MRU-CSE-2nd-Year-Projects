package com.resqnet.service;

import com.resqnet.dto.shelter.CreateShelterRequest;
import com.resqnet.dto.shelter.ShelterResponse;
import com.resqnet.dto.shelter.UpdateOccupancyRequest;
import com.resqnet.enums.ShelterStatus;

import java.util.List;

public interface ShelterService {
    ShelterResponse createShelter(CreateShelterRequest request, String creatorEmail);
    List<ShelterResponse> getAllShelters(ShelterStatus status);
    ShelterResponse getShelterById(Long id, Double userLat, Double userLon);
    List<ShelterResponse> getNearbyShelters(Double lat, Double lon, Double radiusKm);
    ShelterResponse updateOccupancy(Long id, UpdateOccupancyRequest request);
    ShelterResponse updateStatus(Long id, ShelterStatus status);
}
