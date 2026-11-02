package com.careerguidance.repository;

import com.careerguidance.model.UserSkill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends MongoRepository<UserSkill, String> {
    List<UserSkill> findByUserId(String userId);
    Optional<UserSkill> findByUserIdAndSkillNameIgnoreCase(String userId, String skillName);
    void deleteByUserIdAndSkillNameIgnoreCase(String userId, String skillName);
}
