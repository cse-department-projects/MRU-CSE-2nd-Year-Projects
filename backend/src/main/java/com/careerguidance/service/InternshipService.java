package com.careerguidance.service;

import com.careerguidance.dto.InternshipDto;
import com.careerguidance.model.Internship;
import com.careerguidance.model.SavedInternship;
import com.careerguidance.model.User;
import com.careerguidance.model.UserSkill;
import com.careerguidance.repository.InternshipRepository;
import com.careerguidance.repository.SavedInternshipRepository;
import com.careerguidance.repository.UserRepository;
import com.careerguidance.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InternshipService {

    private final InternshipRepository internshipRepository;
    private final SavedInternshipRepository savedInternshipRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final MatchingEngineService matchingEngineService;

    public InternshipService(
            InternshipRepository internshipRepository,
            SavedInternshipRepository savedInternshipRepository,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            MatchingEngineService matchingEngineService
    ) {
        this.internshipRepository = internshipRepository;
        this.savedInternshipRepository = savedInternshipRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.matchingEngineService = matchingEngineService;
    }

    public List<InternshipDto> getInternships(String userEmail, String search, String workMode, String location) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());

        Set<String> savedInternshipIds = savedInternshipRepository.findByUserId(user.getId()).stream()
                .map(SavedInternship::getInternshipId).collect(Collectors.toSet());

        return internshipRepository.findAll().stream()
                .map(internship -> matchingEngineService.matchInternship(user, internship, skillNames, savedInternshipIds.contains(internship.getId())))
                .filter(dto -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase().trim();
                        boolean matchesTitle = dto.getInternship().getTitle().toLowerCase().contains(s);
                        boolean matchesCompany = dto.getInternship().getCompany().toLowerCase().contains(s);
                        boolean matchesSkill = dto.getInternship().getSkills().stream().anyMatch(sk -> sk.toLowerCase().contains(s));
                        if (!matchesTitle && !matchesCompany && !matchesSkill) return false;
                    }
                    if (workMode != null && !workMode.equalsIgnoreCase("All") && !workMode.isEmpty()) {
                        if (!dto.getInternship().getWorkMode().equalsIgnoreCase(workMode)) return false;
                    }
                    if (location != null && !location.equalsIgnoreCase("All") && !location.isEmpty()) {
                        if (!dto.getInternship().getLocation().toLowerCase().contains(location.toLowerCase())) return false;
                    }
                    return true;
                })
                .sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()))
                .collect(Collectors.toList());
    }

    public List<InternshipDto> getRecommendedInternships(String userEmail) {
        return getInternships(userEmail, null, null, null).stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    public InternshipDto saveInternship(String userEmail, String internshipId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (savedInternshipRepository.findByUserIdAndInternshipId(user.getId(), internshipId).isEmpty()) {
            savedInternshipRepository.save(new SavedInternship(user.getId(), internshipId));
        }

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new IllegalArgumentException("Internship not found"));
        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());
        return matchingEngineService.matchInternship(user, internship, skillNames, true);
    }

    public void unsaveInternship(String userEmail, String internshipId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        savedInternshipRepository.deleteByUserIdAndInternshipId(user.getId(), internshipId);
    }

    public List<InternshipDto> getSavedInternships(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<SavedInternship> saved = savedInternshipRepository.findByUserId(user.getId());
        Set<String> savedIds = saved.stream().map(SavedInternship::getInternshipId).collect(Collectors.toSet());

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());

        return internshipRepository.findAll().stream()
                .filter(i -> savedIds.contains(i.getId()))
                .map(i -> matchingEngineService.matchInternship(user, i, skillNames, true))
                .collect(Collectors.toList());
    }
}
