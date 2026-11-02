package com.careerguidance.controller;

import com.careerguidance.dto.MessageResponse;
import com.careerguidance.dto.SkillDto;
import com.careerguidance.model.Skill;
import com.careerguidance.model.UserSkill;
import com.careerguidance.service.SkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping("/catalog")
    public ResponseEntity<List<Skill>> getCatalog() {
        return ResponseEntity.ok(skillService.getSkillCatalog());
    }

    @GetMapping("/my-skills")
    public ResponseEntity<List<UserSkill>> getUserSkills(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(skillService.getUserSkills(email));
    }

    @PostMapping("/my-skills")
    public ResponseEntity<UserSkill> addSkill(Authentication authentication, @RequestBody SkillDto dto) {
        String email = authentication.getName();
        return ResponseEntity.ok(skillService.addUserSkill(email, dto));
    }

    @PutMapping("/my-skills/{id}")
    public ResponseEntity<UserSkill> updateProficiency(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String email = authentication.getName();
        String proficiency = body.getOrDefault("proficiency", "Intermediate");
        return ResponseEntity.ok(skillService.updateSkillProficiency(email, id, proficiency));
    }

    @DeleteMapping("/my-skills/{id}")
    public ResponseEntity<?> removeSkill(Authentication authentication, @PathVariable String id) {
        String email = authentication.getName();
        skillService.removeUserSkill(email, id);
        return ResponseEntity.ok(new MessageResponse(true, "Skill removed successfully."));
    }
}
