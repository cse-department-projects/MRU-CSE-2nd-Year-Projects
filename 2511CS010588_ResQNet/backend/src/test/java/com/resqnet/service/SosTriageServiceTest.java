package com.resqnet.service;

import com.resqnet.dto.sos.SosAlertResponse;
import com.resqnet.enums.EmergencyType;
import com.resqnet.enums.SosPriority;
import com.resqnet.service.impl.SosServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SosTriageServiceTest {

    @Test
    @DisplayName("Calculate triage score for medical assistance required (+35)")
    void testMedicalAttentionNeededScoring() {
        // Base: trapped=1 (+5), type=GENERAL_LIFE_THREAT (+20) -> base = 25
        int withoutMed = SosServiceImpl.calculateTriageScore(EmergencyType.GENERAL_LIFE_THREAT, 1, false);
        int withMed = SosServiceImpl.calculateTriageScore(EmergencyType.GENERAL_LIFE_THREAT, 1, true);

        assertEquals(25, withoutMed);
        assertEquals(60, withMed);
        assertEquals(35, withMed - withoutMed);
    }

    @Test
    @DisplayName("Calculate trapped count tiered scoring (+35, +25, +15, +5, fallbacks)")
    void testTrappedCountScoring() {
        // With emergency type null (+20) and medical null (+0)
        // >= 5 trapped -> +35 (total 55)
        assertEquals(55, SosServiceImpl.calculateTriageScore(null, 5, null));
        assertEquals(55, SosServiceImpl.calculateTriageScore(null, 10, null));

        // 3-4 trapped -> +25 (total 45)
        assertEquals(45, SosServiceImpl.calculateTriageScore(null, 4, null));
        assertEquals(45, SosServiceImpl.calculateTriageScore(null, 3, null));

        // 2 trapped -> +15 (total 35)
        assertEquals(35, SosServiceImpl.calculateTriageScore(null, 2, null));

        // 1 trapped -> +5 (total 25)
        assertEquals(25, SosServiceImpl.calculateTriageScore(null, 1, null));

        // Fallbacks for null, 0, negative -> default to 1 (+5, total 25)
        assertEquals(25, SosServiceImpl.calculateTriageScore(null, null, null));
        assertEquals(25, SosServiceImpl.calculateTriageScore(null, 0, null));
        assertEquals(25, SosServiceImpl.calculateTriageScore(null, -2, null));
    }

    @Test
    @DisplayName("Calculate emergency type scoring")
    void testEmergencyTypeScoring() {
        // With trapped=1 (+5) and medical=false (+0)
        assertEquals(30, SosServiceImpl.calculateTriageScore(EmergencyType.WATER_LEVEL_RISING, 1, false)); // 25 + 5
        assertEquals(30, SosServiceImpl.calculateTriageScore(EmergencyType.FIRE, 1, false));               // 25 + 5
        assertEquals(25, SosServiceImpl.calculateTriageScore(EmergencyType.GENERAL_LIFE_THREAT, 1, false));// 20 + 5
        assertEquals(20, SosServiceImpl.calculateTriageScore(EmergencyType.MEDICAL, 1, false));            // 15 + 5
        assertEquals(20, SosServiceImpl.calculateTriageScore(EmergencyType.TRAPPED, 1, false));            // 15 + 5
        assertEquals(25, SosServiceImpl.calculateTriageScore(null, 1, false));                             // fallback 20 + 5
    }

    @Test
    @DisplayName("Determine priority based on score thresholds (CRITICAL, URGENT, HIGH, MEDIUM)")
    void testDeterminePriority() {
        // CRITICAL >= 65
        assertEquals(SosPriority.CRITICAL, SosServiceImpl.determinePriority(95));
        assertEquals(SosPriority.CRITICAL, SosServiceImpl.determinePriority(65));

        // URGENT: 45 - 64
        assertEquals(SosPriority.URGENT, SosServiceImpl.determinePriority(64));
        assertEquals(SosPriority.URGENT, SosServiceImpl.determinePriority(50));
        assertEquals(SosPriority.URGENT, SosServiceImpl.determinePriority(45));

        // HIGH: 25 - 44
        assertEquals(SosPriority.HIGH, SosServiceImpl.determinePriority(44));
        assertEquals(SosPriority.HIGH, SosServiceImpl.determinePriority(30));
        assertEquals(SosPriority.HIGH, SosServiceImpl.determinePriority(25));

        // MEDIUM: < 25
        assertEquals(SosPriority.MEDIUM, SosServiceImpl.determinePriority(24));
        assertEquals(SosPriority.MEDIUM, SosServiceImpl.determinePriority(15));
        assertEquals(SosPriority.MEDIUM, SosServiceImpl.determinePriority(0));
    }

    @Test
    @DisplayName("Active queue sorting by triageScore DESC then createdAt ASC")
    void testQueueSortingLogic() {
        LocalDateTime now = LocalDateTime.now();

        SosAlertResponse alert1 = new SosAlertResponse();
        alert1.setId(1L);
        alert1.setTriageScore(30);
        alert1.setCreatedAt(now.minusMinutes(10));

        SosAlertResponse alert2 = new SosAlertResponse();
        alert2.setId(2L);
        alert2.setTriageScore(85);
        alert2.setCreatedAt(now.minusMinutes(5));

        SosAlertResponse alert3 = new SosAlertResponse();
        alert3.setId(3L);
        alert3.setTriageScore(85);
        alert3.setCreatedAt(now.minusMinutes(15)); // earlier arrival with same critical score

        List<SosAlertResponse> queue = new ArrayList<>(List.of(alert1, alert2, alert3));
        queue.sort(Comparator
                .comparing(SosAlertResponse::getTriageScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(SosAlertResponse::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
        );

        // Expected order: alert3 (85 score, 15 min ago), alert2 (85 score, 5 min ago), alert1 (30 score)
        assertEquals(3L, queue.get(0).getId());
        assertEquals(2L, queue.get(1).getId());
        assertEquals(1L, queue.get(2).getId());
    }
}

