package com.careerguidance.service;

import com.careerguidance.dto.CareerMatchDto;
import com.careerguidance.dto.InternshipDto;
import com.careerguidance.dto.JobDto;
import com.careerguidance.model.Career;
import com.careerguidance.model.Internship;
import com.careerguidance.model.Job;
import com.careerguidance.model.User;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingEngineService {

    /**
     * Calculates transparent weighted career match score:
     * Skills match: 40%
     * Domain/Preference: 20%
     * Education: 10%
     * Experience: 10%
     * Interests: 10%
     * Location/Work Mode: 10%
     */
    public CareerMatchDto matchCareer(User user, Career career, List<String> userSkillNames) {
        List<String> safeSkillNames = userSkillNames != null ? userSkillNames : Collections.emptyList();
        Set<String> normalizedUserSkills = safeSkillNames.stream()
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .map(String::trim)
                .collect(Collectors.toSet());

        List<String> requiredSkills = career.getRequiredSkills() != null ? career.getRequiredSkills() : Collections.emptyList();
        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String reqSkill : requiredSkills) {
            if (reqSkill != null && normalizedUserSkills.contains(reqSkill.toLowerCase().trim())) {
                matchingSkills.add(reqSkill);
            } else if (reqSkill != null) {
                missingSkills.add(reqSkill);
            }
        }

        // 1. Skill Score (40 points max)
        double skillRatio = requiredSkills.isEmpty() ? 1.0 :
                (double) matchingSkills.size() / requiredSkills.size();
        double skillScore = skillRatio * 40.0;

        // 2. Domain / Preference Score (20 points max)
        double domainScore = 0.0;
        if (user != null && user.getPreferredDomain() != null && career.getDomain() != null &&
                user.getPreferredDomain().equalsIgnoreCase(career.getDomain())) {
            domainScore = 20.0;
        } else if (user != null && user.getPreferredRole() != null && career.getTitle() != null &&
                user.getPreferredRole().toLowerCase().contains(career.getTitle().toLowerCase())) {
            domainScore = 18.0;
        } else {
            domainScore = 8.0;
        }

        // 3. Education Score (10 points max)
        double educationScore = 10.0;
        if (user != null && user.getDegree() != null && (user.getDegree().toLowerCase().contains("b.tech") ||
                user.getDegree().toLowerCase().contains("b.e.") ||
                user.getDegree().toLowerCase().contains("bca") ||
                user.getDegree().toLowerCase().contains("mca") ||
                user.getDegree().toLowerCase().contains("b.sc"))) {
            educationScore = 10.0;
        } else {
            educationScore = 7.0;
        }

        // 4. Experience Score (10 points max)
        double experienceScore = 10.0;
        if (user != null && user.getExperienceLevel() != null && career.getExperienceLevel() != null &&
                user.getExperienceLevel().equalsIgnoreCase(career.getExperienceLevel())) {
            experienceScore = 10.0;
        } else {
            experienceScore = 7.0;
        }

        // 5. Interests Score (10 points max)
        double interestScore = 5.0;
        if (user != null && user.getInterests() != null && career.getTitle() != null && career.getDomain() != null) {
            for (String interest : user.getInterests()) {
                if (interest != null && (career.getTitle().toLowerCase().contains(interest.toLowerCase()) ||
                        career.getDomain().toLowerCase().contains(interest.toLowerCase()))) {
                    interestScore = 10.0;
                    break;
                }
            }
        }

        // 6. Location / Work Mode Score (10 points max)
        double locationScore = 9.0;

        int totalScore = (int) Math.round(skillScore + domainScore + educationScore + experienceScore + interestScore + locationScore);
        totalScore = Math.min(100, Math.max(15, totalScore));

        String matchReason = String.format("Matches %d of %d required skills with strong %s domain alignment.",
                matchingSkills.size(), requiredSkills.size(), career.getDomain() != null ? career.getDomain() : "tech");

        return new CareerMatchDto(career, totalScore, matchingSkills, missingSkills, matchReason);
    }

    /**
     * Calculates Job match score
     */
    public JobDto matchJob(User user, Job job, List<String> userSkillNames, boolean isSaved) {
        List<String> safeSkillNames = userSkillNames != null ? userSkillNames : Collections.emptyList();
        Set<String> normalizedUserSkills = safeSkillNames.stream()
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .map(String::trim)
                .collect(Collectors.toSet());

        List<String> jobSkills = job.getSkills() != null ? job.getSkills() : Collections.emptyList();
        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String reqSkill : jobSkills) {
            if (reqSkill != null && normalizedUserSkills.contains(reqSkill.toLowerCase().trim())) {
                matching.add(reqSkill);
            } else if (reqSkill != null) {
                missing.add(reqSkill);
            }
        }

        double skillRatio = jobSkills.isEmpty() ? 1.0 : (double) matching.size() / jobSkills.size();
        double skillScore = skillRatio * 50.0;

        double modeScore = (user != null && user.getPreferredWorkMode() != null && job.getWorkMode() != null &&
                user.getPreferredWorkMode().equalsIgnoreCase(job.getWorkMode())) ? 20.0 : 10.0;
        double expScore = (user != null && user.getExperienceLevel() != null && job.getExperience() != null &&
                job.getExperience().toLowerCase().contains("fresher")) ? 20.0 : 15.0;
        double locScore = 10.0;

        int total = (int) Math.round(skillScore + modeScore + expScore + locScore);
        total = Math.min(100, Math.max(20, total));

        return new JobDto(job, total, matching, missing, isSaved);
    }

    /**
     * Calculates Internship match score
     */
    public InternshipDto matchInternship(User user, Internship internship, List<String> userSkillNames, boolean isSaved) {
        List<String> safeSkillNames = userSkillNames != null ? userSkillNames : Collections.emptyList();
        Set<String> normalizedUserSkills = safeSkillNames.stream()
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .map(String::trim)
                .collect(Collectors.toSet());

        List<String> internshipSkills = internship.getSkills() != null ? internship.getSkills() : Collections.emptyList();
        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String reqSkill : internshipSkills) {
            if (reqSkill != null && normalizedUserSkills.contains(reqSkill.toLowerCase().trim())) {
                matching.add(reqSkill);
            } else if (reqSkill != null) {
                missing.add(reqSkill);
            }
        }

        double skillRatio = internshipSkills.isEmpty() ? 1.0 : (double) matching.size() / internshipSkills.size();
        double skillScore = skillRatio * 55.0;

        double modeScore = (user != null && user.getPreferredWorkMode() != null && internship.getWorkMode() != null &&
                user.getPreferredWorkMode().equalsIgnoreCase(internship.getWorkMode())) ? 25.0 : 15.0;
        double durationScore = 20.0;

        int total = (int) Math.round(skillScore + modeScore + durationScore);
        total = Math.min(100, Math.max(25, total));

        return new InternshipDto(internship, total, matching, missing, isSaved);
    }
}
