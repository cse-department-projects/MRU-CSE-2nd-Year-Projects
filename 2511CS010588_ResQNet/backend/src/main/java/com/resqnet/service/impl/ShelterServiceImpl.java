package com.resqnet.service.impl;

import com.resqnet.dto.shelter.CreateShelterRequest;
import com.resqnet.dto.shelter.ShelterResponse;
import com.resqnet.dto.shelter.UpdateOccupancyRequest;
import com.resqnet.entity.Shelter;
import com.resqnet.entity.User;
import com.resqnet.enums.ShelterStatus;
import com.resqnet.exception.BadRequestException;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.ShelterRepository;
import com.resqnet.repository.UserRepository;
import com.resqnet.service.ShelterService;
import com.resqnet.util.GeoUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShelterServiceImpl implements ShelterService {

    private final ShelterRepository shelterRepository;
    private final UserRepository userRepository;

    public ShelterServiceImpl(ShelterRepository shelterRepository, UserRepository userRepository) {
        this.shelterRepository = shelterRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ShelterResponse createShelter(CreateShelterRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + creatorEmail));

        Shelter shelter = new Shelter();
        shelter.setName(request.getName().trim());
        shelter.setType(request.getType() != null ? request.getType() : "COMMUNITY_HALL");
        shelter.setTotalCapacity(request.getTotalCapacity());
        shelter.setCurrentOccupancy(request.getCurrentOccupancy() != null ? request.getCurrentOccupancy() : 0);
        shelter.setLatitude(request.getLatitude());
        shelter.setLongitude(request.getLongitude());
        shelter.setAddress(request.getAddress().trim());
        shelter.setContactPerson(request.getContactPerson());
        shelter.setContactPhone(request.getContactPhone());
        shelter.setFoodAvailable(request.getFoodAvailable() != null ? request.getFoodAvailable() : true);
        shelter.setMedicalSupportAvailable(request.getMedicalSupportAvailable() != null ? request.getMedicalSupportAvailable() : true);
        shelter.setPetFriendly(request.getPetFriendly() != null ? request.getPetFriendly() : true);
        shelter.setPowerBackup(request.getPowerBackup() != null ? request.getPowerBackup() : true);
        shelter.setStatus(request.getStatus() != null ? request.getStatus() : ShelterStatus.OPEN);
        shelter.setCreatedBy(creator);

        Shelter saved = shelterRepository.save(shelter);
        return mapToResponse(saved, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShelterResponse> getAllShelters(ShelterStatus status) {
        List<Shelter> shelters;
        if (status != null) {
            shelters = shelterRepository.findByStatus(status);
        } else {
            shelters = shelterRepository.findAllByOrderByCreatedAtDesc();
        }

        return shelters.stream()
                .map(s -> mapToResponse(s, null, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ShelterResponse getShelterById(Long id, Double userLat, Double userLon) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));

        return mapToResponse(shelter, userLat, userLon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShelterResponse> getNearbyShelters(Double lat, Double lon, Double radiusKm) {
        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 25.0;
        List<Shelter> shelters = shelterRepository.findAllByOrderByCreatedAtDesc();

        return shelters.stream()
                .filter(s -> {
                    if (s.getLatitude() == null || s.getLongitude() == null) return false;
                    double dist = GeoUtils.calculateDistanceKm(lat, lon, s.getLatitude(), s.getLongitude());
                    return dist <= maxRadius;
                })
                .sorted(Comparator.comparingDouble(s ->
                        GeoUtils.calculateDistanceKm(lat, lon, s.getLatitude(), s.getLongitude())))
                .map(s -> mapToResponse(s, lat, lon))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShelterResponse updateOccupancy(Long id, UpdateOccupancyRequest request) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));

        if (request.getCurrentOccupancy() > shelter.getTotalCapacity()) {
            throw new BadRequestException("Occupancy (" + request.getCurrentOccupancy()
                    + ") cannot exceed total capacity (" + shelter.getTotalCapacity() + ")");
        }

        shelter.setCurrentOccupancy(request.getCurrentOccupancy());

        // Auto-update status based on occupancy
        if (request.getCurrentOccupancy() >= shelter.getTotalCapacity()) {
            shelter.setStatus(ShelterStatus.FULL);
        } else if (shelter.getStatus() == ShelterStatus.FULL) {
            shelter.setStatus(ShelterStatus.OPEN);
        }

        Shelter updated = shelterRepository.save(shelter);
        return mapToResponse(updated, null, null);
    }

    @Override
    @Transactional
    public ShelterResponse updateStatus(Long id, ShelterStatus status) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));

        shelter.setStatus(status);
        Shelter updated = shelterRepository.save(shelter);
        return mapToResponse(updated, null, null);
    }

    private ShelterResponse mapToResponse(Shelter shelter, Double userLat, Double userLon) {
        ShelterResponse res = new ShelterResponse();
        res.setId(shelter.getId());
        res.setName(shelter.getName());
        res.setType(shelter.getType());
        res.setTotalCapacity(shelter.getTotalCapacity());
        res.setCurrentOccupancy(shelter.getCurrentOccupancy());

        int available = shelter.getTotalCapacity() - shelter.getCurrentOccupancy();
        res.setAvailableCapacity(Math.max(available, 0));

        double percentage = shelter.getTotalCapacity() > 0
                ? (shelter.getCurrentOccupancy() * 100.0 / shelter.getTotalCapacity())
                : 0.0;
        res.setOccupancyPercentage(Math.round(percentage * 10.0) / 10.0);

        res.setLatitude(shelter.getLatitude());
        res.setLongitude(shelter.getLongitude());
        res.setAddress(shelter.getAddress());
        res.setContactPerson(shelter.getContactPerson());
        res.setContactPhone(shelter.getContactPhone());
        res.setFoodAvailable(shelter.getFoodAvailable());
        res.setMedicalSupportAvailable(shelter.getMedicalSupportAvailable());
        res.setPetFriendly(shelter.getPetFriendly());
        res.setPowerBackup(shelter.getPowerBackup());
        res.setStatus(shelter.getStatus());

        if (userLat != null && userLon != null && shelter.getLatitude() != null && shelter.getLongitude() != null) {
            double dist = GeoUtils.calculateDistanceKm(userLat, userLon, shelter.getLatitude(), shelter.getLongitude());
            res.setDistanceKm(Math.round(dist * 100.0) / 100.0);
        }

        res.setUpdatedAt(shelter.getUpdatedAt());
        return res;
    }
}
