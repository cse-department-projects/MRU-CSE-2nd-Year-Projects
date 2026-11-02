package com.resqnet.service.impl;

import com.resqnet.dto.disaster.CreateDisasterReportRequest;
import com.resqnet.dto.disaster.DisasterReportResponse;
import com.resqnet.dto.disaster.VerifyDisasterRequest;
import com.resqnet.entity.DisasterReport;
import com.resqnet.entity.User;
import com.resqnet.enums.DisasterStatus;
import com.resqnet.enums.DisasterType;
import com.resqnet.enums.NotificationType;
import com.resqnet.enums.Severity;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.DisasterReportRepository;
import com.resqnet.repository.UserRepository;
import com.resqnet.service.DisasterService;
import com.resqnet.service.NotificationService;
import com.resqnet.util.GeoUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisasterServiceImpl implements DisasterService {

    private final DisasterReportRepository disasterReportRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public DisasterServiceImpl(DisasterReportRepository disasterReportRepository,
                               UserRepository userRepository,
                               NotificationService notificationService) {
        this.disasterReportRepository = disasterReportRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public DisasterReportResponse createReport(CreateDisasterReportRequest request, String userEmail) {
        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        DisasterReport report = new DisasterReport();
        report.setReporter(reporter);
        report.setTitle(request.getTitle().trim());
        report.setDisasterType(request.getDisasterType());
        report.setSeverity(request.getSeverity() != null ? request.getSeverity() : Severity.MEDIUM);
        report.setDescription(request.getDescription().trim());
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setLocationName(request.getLocationName());
        report.setMediaUrls(request.getMediaUrls());
        report.setEstimatedAffectedPeople(request.getEstimatedAffectedPeople() != null ? request.getEstimatedAffectedPeople() : 0);
        report.setStatus(DisasterStatus.PENDING);

        DisasterReport saved = disasterReportRepository.save(report);
        return mapToResponse(saved, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisasterReportResponse> getAllReports(DisasterType type, Severity severity, DisasterStatus status) {
        List<DisasterReport> reports = disasterReportRepository.findAllByOrderByCreatedAtDesc();

        return reports.stream()
                .filter(r -> type == null || r.getDisasterType() == type)
                .filter(r -> severity == null || r.getSeverity() == severity)
                .filter(r -> status == null || r.getStatus() == status)
                .map(r -> mapToResponse(r, null, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisasterReportResponse> getNearbyReports(Double lat, Double lon, Double radiusKm) {
        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 25.0;
        List<DisasterReport> reports = disasterReportRepository.findAllByOrderByCreatedAtDesc();

        return reports.stream()
                .filter(r -> {
                    if (lat == null || lon == null || r.getLatitude() == null || r.getLongitude() == null) {
                        return true;
                    }
                    double dist = GeoUtils.calculateDistanceKm(lat, lon, r.getLatitude(), r.getLongitude());
                    return dist <= maxRadius;
                })
                .map(r -> {
                    Double dist = (lat != null && lon != null && r.getLatitude() != null && r.getLongitude() != null)
                            ? GeoUtils.calculateDistanceKm(lat, lon, r.getLatitude(), r.getLongitude())
                            : null;
                    return mapToResponse(r, lat, lon);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DisasterReportResponse getReportById(Long id, Double currentLat, Double currentLon) {
        DisasterReport report = disasterReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disaster report not found with id: " + id));

        return mapToResponse(report, currentLat, currentLon);
    }

    @Override
    @Transactional
    public DisasterReportResponse verifyReport(Long id, VerifyDisasterRequest request, String verifierEmail) {
        DisasterReport report = disasterReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disaster report not found with id: " + id));

        User verifier = userRepository.findByEmail(verifierEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Verifier user not found with email: " + verifierEmail));

        report.setStatus(request.getStatus());
        if (request.getUpdatedSeverity() != null) {
            report.setSeverity(request.getUpdatedSeverity());
        }
        report.setVerifiedBy(verifier);

        DisasterReport updated = disasterReportRepository.save(report);

        // Notify reporter if status changed to VERIFIED
        if (request.getStatus() == DisasterStatus.VERIFIED && updated.getReporter() != null) {
            notificationService.sendNotification(
                    updated.getReporter(),
                    "Disaster Report Verified",
                    "Your field report '" + updated.getTitle() + "' has been verified by emergency responders.",
                    NotificationType.DISASTER_VERIFIED,
                    "/citizen"
            );
        }

        return mapToResponse(updated, null, null);
    }

    @Override
    @Transactional
    public DisasterReportResponse updateStatus(Long id, DisasterStatus status) {
        DisasterReport report = disasterReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disaster report not found with id: " + id));

        report.setStatus(status);
        DisasterReport updated = disasterReportRepository.save(report);

        // Notify reporter if status changed to VERIFIED
        if (status == DisasterStatus.VERIFIED && updated.getReporter() != null) {
            notificationService.sendNotification(
                    updated.getReporter(),
                    "Disaster Report Verified",
                    "Your field report '" + updated.getTitle() + "' has been verified by emergency responders.",
                    NotificationType.DISASTER_VERIFIED,
                    "/citizen"
            );
        }

        return mapToResponse(updated, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisasterReportResponse> getMyReports(String userEmail) {
        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return disasterReportRepository.findByReporterIdOrderByCreatedAtDesc(reporter.getId()).stream()
                .map(r -> mapToResponse(r, null, null))
                .collect(Collectors.toList());
    }

    private DisasterReportResponse mapToResponse(DisasterReport report, Double userLat, Double userLon) {
        DisasterReportResponse res = new DisasterReportResponse();
        res.setId(report.getId());
        res.setReporterId(report.getReporter().getId());
        res.setReporterName(report.getReporter().getFullName());
        res.setReporterPhone(report.getReporter().getPhone());
        res.setTitle(report.getTitle());
        res.setDisasterType(report.getDisasterType());
        res.setSeverity(report.getSeverity());
        res.setDescription(report.getDescription());
        res.setLatitude(report.getLatitude());
        res.setLongitude(report.getLongitude());
        res.setLocationName(report.getLocationName());
        res.setMediaUrls(report.getMediaUrls());
        res.setEstimatedAffectedPeople(report.getEstimatedAffectedPeople());
        res.setStatus(report.getStatus());
        if (report.getVerifiedBy() != null) {
            res.setVerifiedById(report.getVerifiedBy().getId());
            res.setVerifiedByName(report.getVerifiedBy().getFullName());
        }
        if (userLat != null && userLon != null && report.getLatitude() != null && report.getLongitude() != null) {
            res.setDistanceKm(Math.round(GeoUtils.calculateDistanceKm(userLat, userLon, report.getLatitude(), report.getLongitude()) * 100.0) / 100.0);
        }
        res.setCreatedAt(report.getCreatedAt());
        res.setUpdatedAt(report.getUpdatedAt());
        return res;
    }
}
