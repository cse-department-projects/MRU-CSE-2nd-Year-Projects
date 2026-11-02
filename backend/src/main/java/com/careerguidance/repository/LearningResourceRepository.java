package com.careerguidance.repository;

import com.careerguidance.model.LearningResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningResourceRepository extends MongoRepository<LearningResource, String> {
    List<LearningResource> findBySkillNameIgnoreCase(String skillName);
    List<LearningResource> findByDifficulty(String difficulty);
}
