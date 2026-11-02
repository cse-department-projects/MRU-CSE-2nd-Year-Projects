package com.careerguidance.service;

import com.careerguidance.dto.SkillDto;
import com.careerguidance.model.Skill;
import com.careerguidance.model.User;
import com.careerguidance.model.UserSkill;
import com.careerguidance.repository.SkillRepository;
import com.careerguidance.repository.UserRepository;
import com.careerguidance.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;

    public SkillService(
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            UserRepository userRepository
    ) {
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
    }

    public List<Skill> getSkillCatalog() {
        return skillRepository.findAll();
    }

    public List<UserSkill> getUserSkills(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return userSkillRepository.findByUserId(user.getId());
    }

    public UserSkill addUserSkill(String email, SkillDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String rawName = dto.getName() != null ? dto.getName() : dto.getSkillName();
        if (rawName == null || rawName.trim().isEmpty()) {
            throw new IllegalArgumentException("Skill name cannot be empty");
        }

        String skillName = rawName.trim();
        Optional<UserSkill> existing = userSkillRepository.findByUserIdAndSkillNameIgnoreCase(user.getId(), skillName);
        if (existing.isPresent()) {
            UserSkill skill = existing.get();
            skill.setProficiency(dto.getProficiency() != null ? dto.getProficiency() : "Intermediate");
            if (dto.getCategory() != null) skill.setCategory(dto.getCategory());
            return userSkillRepository.save(skill);
        }

        UserSkill userSkill = new UserSkill(
                user.getId(),
                skillName,
                dto.getCategory() != null ? dto.getCategory() : "Technical",
                dto.getProficiency() != null ? dto.getProficiency() : "Intermediate"
        );
        return userSkillRepository.save(userSkill);
    }

    public UserSkill updateSkillProficiency(String email, String skillId, String proficiency) {
        UserSkill userSkill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found"));
        userSkill.setProficiency(proficiency != null ? proficiency : "Intermediate");
        return userSkillRepository.save(userSkill);
    }

    public void removeUserSkill(String email, String skillId) {
        userSkillRepository.deleteById(skillId);
    }
}
