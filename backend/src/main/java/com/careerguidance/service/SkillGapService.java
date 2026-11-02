package com.careerguidance.service;

import com.careerguidance.model.Career;
import com.careerguidance.model.SkillGap;
import com.careerguidance.model.SkillGap.MissingSkillDetail;
import com.careerguidance.model.User;
import com.careerguidance.model.UserSkill;
import com.careerguidance.repository.CareerRepository;
import com.careerguidance.repository.SkillGapRepository;
import com.careerguidance.repository.UserRepository;
import com.careerguidance.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillGapService {

    private final SkillGapRepository skillGapRepository;
    private final CareerRepository careerRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    public SkillGapService(
            SkillGapRepository skillGapRepository,
            CareerRepository careerRepository,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository
    ) {
        this.skillGapRepository = skillGapRepository;
        this.careerRepository = careerRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
    }

    public SkillGap analyzeSkillGap(String userEmail, String careerId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new IllegalArgumentException("Career not found"));

        List<UserSkill> userSkills = userSkillRepository.findByUserId(user.getId());
        List<String> userSkillNames = userSkills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());
        Set<String> normalizedUserSkills = userSkillNames.stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<MissingSkillDetail> missing = new ArrayList<>();
        List<String> reqSkills = career.getRequiredSkills() != null ? career.getRequiredSkills() : Collections.emptyList();

        for (int i = 0; i < reqSkills.size(); i++) {
            String reqSkill = reqSkills.get(i);
            if (reqSkill != null && normalizedUserSkills.contains(reqSkill.toLowerCase().trim())) {
                matched.add(reqSkill);
            } else if (reqSkill != null) {
                String importance = (i < 3) ? "High" : (i < 6 ? "Medium" : "Foundational");
                String whyRequired = String.format("Core requirement for production-level %s workflows.", career.getTitle());
                String resource = "Curated Masterclass & Hands-on Exercises";
                String duration = "2-3 Weeks";
                String roadmapPos = "Phase " + ((i % 4) + 1);

                missing.add(new MissingSkillDetail(reqSkill, importance, whyRequired, resource, duration, roadmapPos));
            }
        }

        int totalRequired = reqSkills.size();
        int matchPct = totalRequired == 0 ? 100 : (int) Math.round(((double) matched.size() / totalRequired) * 100);

        SkillGap gap = skillGapRepository.findByUserIdAndCareerId(user.getId(), careerId)
                .orElse(new SkillGap());

        gap.setUserId(user.getId());
        gap.setCareerId(careerId);
        gap.setCareerTitle(career.getTitle());
        gap.setRequiredSkills(reqSkills);
        gap.setUserSkills(userSkillNames);
        gap.setMatchedSkills(matched);
        gap.setMissingSkills(missing);
        gap.setMatchPercentage(matchPct);
        gap.setAnalyzedAt(LocalDateTime.now());

        return skillGapRepository.save(gap);
    }

    public SkillGap markSkillCompleted(String userEmail, String careerId, String skillName) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Add to UserSkills if not present
        Optional<UserSkill> existing = userSkillRepository.findByUserIdAndSkillNameIgnoreCase(user.getId(), skillName.trim());
        if (existing.isEmpty()) {
            userSkillRepository.save(new UserSkill(user.getId(), skillName.trim(), "Technical", "Intermediate"));
        }

        // Re-run analysis
        return analyzeSkillGap(userEmail, careerId);
    }
}
