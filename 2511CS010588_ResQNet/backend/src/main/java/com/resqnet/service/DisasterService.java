package com.resqnet.service;

import com.resqnet.dto.disaster.CreateDisasterReportRequest;
import com.resqnet.dto.disaster.DisasterReportResponse;
import com.resqnet.dto.disaster.VerifyDisasterRequest;
import com.resqnet.enums.DisasterStatus;
import com.resqnet.enums.DisasterType;
import com.resqnet.enums.Severity;

import java.util.List;

public interface DisasterService {
    DisasterReportResponse createReport(CreateDisasterReportRequest request, String userEmail);
    List<DisasterReportResponse> getAllReports(DisasterType type, Severity severity, DisasterStatus status);
    List<DisasterReportResponse> getNearbyReports(Double lat, Double lon, Double radiusKm);
    DisasterReportResponse getReportById(Long id, Double currentLat, Double currentLon);
    DisasterReportResponse verifyReport(Long id, VerifyDisasterRequest request, String verifierEmail);
    DisasterReportResponse updateStatus(Long id, DisasterStatus status);
    List<DisasterReportResponse> getMyReports(String userEmail);
}
