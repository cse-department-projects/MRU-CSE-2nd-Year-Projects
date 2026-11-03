package com.citywatch.service;

import com.citywatch.dto.ReportDtos.*;
import com.citywatch.entity.*;
import com.citywatch.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final EmergencyReportRepository reports;
    private final AppUserRepository users;
    private final AuthorityProfileRepository authorities;
    private final NotificationRepository notifications;

    public ReportService(
            EmergencyReportRepository reports,
            AppUserRepository users,
            AuthorityProfileRepository authorities,
            NotificationRepository notifications) {

        this.reports = reports;
        this.users = users;
        this.authorities = authorities;
        this.notifications = notifications;
    }

    public ReportResponse create(
            Long citizenId,
            CreateReportRequest req) {

        AppUser citizen = users.findById(citizenId)
                .orElseThrow();

        EmergencyReport r = new EmergencyReport();

        r.setReportCode(
                "CW-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        r.setCitizen(citizen);

        r.setEmergencyType(
                req.emergencyType()
        );

        r.setDepartment(
                mapDepartment(req.emergencyType())
        );

        r.setDescription(
                req.description()
        );

        r.setLocation(
                req.location()
        );

        // Save GPS coordinates
        r.setLatitude(
                req.latitude()
        );

        r.setLongitude(
                req.longitude()
        );

        r.setStatus(
                ReportStatus.REPORTED
        );

        reports.save(r);

        authorities
                .findByDepartment(r.getDepartment())
                .forEach(a -> {

                    Notification n =
                            new Notification();

                    n.setRecipient(
                            a.getUser()
                    );

                    n.setReport(r);

                    n.setMessage(
                            "🚨 New " +
                            prettyType(
                                    r.getEmergencyType()
                            ) +
                            " emergency at " +
                            r.getLocation()
                    );

                    notifications.save(n);
                });

        return toResponse(r);
    }

    public List<ReportResponse> citizenReports(
            Long citizenId) {

        return reports
                .findByCitizenIdOrderByCreatedAtDesc(
                        citizenId
                )
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ReportResponse> authorityReports(
            Long authorityId) {

        Department d =
                authorities
                        .findByUserId(authorityId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Authority profile not found."
                                )
                        )
                        .getDepartment();

        return reports
                .findByDepartmentOrderByCreatedAtDesc(d)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReportResponse updateStatus(
            Long authorityId,
            String reportCode,
            ReportStatus newStatus) {

        Department d =
                authorities
                        .findByUserId(authorityId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Authority profile not found."
                                )
                        )
                        .getDepartment();

        EmergencyReport r =
                reports.findAll()
                        .stream()
                        .filter(
                                x -> x.getReportCode()
                                        .equals(reportCode)
                        )
                        .findFirst()
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Report not found."
                                )
                        );

        if (r.getDepartment() != d) {
            throw new SecurityException(
                    "You cannot update a report outside your department."
            );
        }

        if (!isValidTransition(
                r.getStatus(),
                newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid status transition."
            );
        }

        r.setStatus(newStatus);

        reports.save(r);

        Notification n =
                new Notification();

        n.setRecipient(
                r.getCitizen()
        );

        n.setReport(r);

        n.setMessage(
                statusMessage(r)
        );

        notifications.save(n);

        return toResponse(r);
    }

    public List<com.citywatch.entity.Notification> notifications(
            Long userId) {

        return notifications
                .findByRecipientIdOrderByCreatedAtDesc(
                        userId
                );
    }

    public long unreadNotifications(
            Long userId) {

        return notifications
                .countByRecipientIdAndReadFlagFalse(
                        userId
                );
    }

    public void markNotificationRead(
            Long userId,
            Long notificationId) {

        Notification n =
                notifications
                        .findById(notificationId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Notification not found."
                                )
                        );

        if (!n.getRecipient()
                .getId()
                .equals(userId)) {

            throw new SecurityException(
                    "Not allowed."
            );
        }

        n.setReadFlag(true);

        notifications.save(n);
    }

    private boolean isValidTransition(
            ReportStatus current,
            ReportStatus next) {

        return switch (current) {

            case REPORTED ->
                    next == ReportStatus.ACKNOWLEDGED;

            case ACKNOWLEDGED ->
                    next == ReportStatus.ON_THE_WAY;

            case ON_THE_WAY ->
                    next == ReportStatus.RESOLVED;

            case RESOLVED ->
                    false;
        };
    }

    private String statusMessage(
            EmergencyReport r) {

        String d =
                r.getDepartment()
                        .displayName();

        return switch (r.getStatus()) {

            case ACKNOWLEDGED ->
                    d +
                    " has acknowledged your emergency report.";

            case ON_THE_WAY ->
                    switch (r.getDepartment()) {

                        case FIRE ->
                                "🚒 Fire Department is on the way.";

                        case MEDICAL ->
                                "🚑 Medical Department is on the way.";

                        case CRIME ->
                                "👮 Crime Department is responding to your report.";

                        case ACCIDENT ->
                                "🚨 Accident Response Team is on the way.";
                    };

            case RESOLVED ->
                    "Your emergency report has been resolved by the "
                    + d + ".";

            case REPORTED ->
                    "Your emergency report has been submitted.";
        };
    }

    private Department mapDepartment(
            EmergencyType type) {

        return switch (type) {

            case FIRE ->
                    Department.FIRE;

            case MEDICAL ->
                    Department.MEDICAL;

            case CRIME ->
                    Department.CRIME;

            case ACCIDENT ->
                    Department.ACCIDENT;
        };
    }

    private String prettyType(
            EmergencyType t) {

        return switch (t) {

            case FIRE ->
                    "Fire";

            case MEDICAL ->
                    "Medical";

            case CRIME ->
                    "Crime";

            case ACCIDENT ->
                    "Accident";
        };
    }

    private ReportResponse toResponse(
            EmergencyReport r) {

        return new ReportResponse(
                r.getReportCode(),
                prettyType(r.getEmergencyType()),
                r.getDepartment().displayName(),
                r.getDescription(),
                r.getLocation(),

                // GPS coordinates
                r.getLatitude(),
                r.getLongitude(),

                r.getStatus().name(),
                r.getCitizen().getName(),
                r.getCitizen().getUserCode(),
                r.getCreatedAt().toString(),
                r.getUpdatedAt().toString()
        );
    }
}