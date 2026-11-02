package com.careerguidance.service;

import com.careerguidance.model.LearningResource;
import com.careerguidance.repository.LearningResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningResourceService {

    private final LearningResourceRepository learningResourceRepository;

    public LearningResourceService(LearningResourceRepository learningResourceRepository) {
        this.learningResourceRepository = learningResourceRepository;
    }

    public List<LearningResource> getResources(String skill, String difficulty, String type) {
        return learningResourceRepository.findAll().stream()
                .filter(r -> {
                    if (skill != null && !skill.equalsIgnoreCase("All") && !skill.isEmpty()) {
                        if (!r.getSkillName().equalsIgnoreCase(skill)) return false;
                    }
                    if (difficulty != null && !difficulty.equalsIgnoreCase("All") && !difficulty.isEmpty()) {
                        if (!r.getDifficulty().equalsIgnoreCase(difficulty)) return false;
                    }
                    if (type != null && !type.equalsIgnoreCase("All") && !type.isEmpty()) {
                        if (!r.getType().equalsIgnoreCase(type)) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }
}
