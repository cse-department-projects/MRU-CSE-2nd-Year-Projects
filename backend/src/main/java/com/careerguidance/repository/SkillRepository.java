package com.careerguidance.repository;

import com.careerguidance.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends MongoRepository<Skill, String> {
    List<Skill> findByCategory(String category);
    Optional<Skill> findByNameIgnoreCase(String name);
}
