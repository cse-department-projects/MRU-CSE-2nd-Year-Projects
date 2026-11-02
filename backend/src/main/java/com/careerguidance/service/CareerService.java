package com.careerguidance.service;

import com.careerguidance.dto.CareerMatchDto;
import com.careerguidance.model.Career;
import com.careerguidance.model.User;
import com.careerguidance.model.UserSkill;
import com.careerguidance.repository.CareerRepository;
import com.careerguidance.repository.UserRepository;
import com.careerguidance.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CareerService {

    private final CareerRepository careerRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final MatchingEngineService matchingEngineService;

    public CareerService(
            CareerRepository careerRepository,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            MatchingEngineService matchingEngineService
    ) {
        this.careerRepository = careerRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.matchingEngineService = matchingEngineService;
    }

    public List<Career> getAllCareers() {
        return careerRepository.findAll();
    }

    public Career getCareerById(String id) {
        return careerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Career not found with id: " + id));
    }

    public List<CareerMatchDto> getCareerRecommendations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());

        return careerRepository.findAll().stream()
                .map(career -> matchingEngineService.matchCareer(user, career, skillNames))
                .sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()))
                .collect(Collectors.toList());
    }

    public CareerMatchDto getCareerMatch(String userEmail, String careerId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Career career = getCareerById(careerId);

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());

        return matchingEngineService.matchCareer(user, career, skillNames);
    }
}
