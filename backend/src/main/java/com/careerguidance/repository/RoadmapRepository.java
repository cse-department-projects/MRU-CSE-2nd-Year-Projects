package com.careerguidance.repository;

import com.careerguidance.model.Roadmap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoadmapRepository extends MongoRepository<Roadmap, String> {
    List<Roadmap> findByUserId(String userId);
    Optional<Roadmap> findByUserIdAndCareerId(String userId, String careerId);
}
