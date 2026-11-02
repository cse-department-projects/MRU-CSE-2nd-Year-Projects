package com.careerguidance.repository;

import com.careerguidance.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Resume> findFirstByUserIdOrderByCreatedAtDesc(String userId);
}
