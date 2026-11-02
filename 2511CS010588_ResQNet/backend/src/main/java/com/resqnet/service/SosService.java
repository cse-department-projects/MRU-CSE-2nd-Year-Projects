package com.resqnet.service;

import com.resqnet.dto.sos.AssignSosRequest;
import com.resqnet.dto.sos.RescueUnitSummaryResponse;
import com.resqnet.dto.sos.SosAlertResponse;
import com.resqnet.dto.sos.TriggerSosRequest;
import com.resqnet.dto.sos.UpdateSosStatusRequest;
import com.resqnet.enums.SosStatus;

import java.util.List;

public interface SosService {
    SosAlertResponse triggerSos(TriggerSosRequest request, String userEmail);
    List<SosAlertResponse> getActiveSosQueue(Double lat, Double lon);
    SosAlertResponse getMyActiveSos(String userEmail);
    List<SosAlertResponse> getMySosHistory(String userEmail);
    SosAlertResponse getSosById(Long id);
    SosAlertResponse assignSos(Long id, AssignSosRequest request);
    SosAlertResponse updateSosStatus(Long id, UpdateSosStatusRequest request);
    SosAlertResponse cancelSos(Long id, String userEmail);
    List<RescueUnitSummaryResponse> getRescueUnits();
}
