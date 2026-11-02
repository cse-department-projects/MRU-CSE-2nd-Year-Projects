package com.careerguidance.repository;

import com.careerguidance.model.SavedInternship;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedInternshipRepository extends MongoRepository<SavedInternship, String> {
    List<SavedInternship> findByUserId(String userId);
    Optional<SavedInternship> findByUserIdAndInternshipId(String userId, String internshipId);
    void deleteByUserIdAndInternshipId(String userId, String internshipId);
}
