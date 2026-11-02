package com.careerguidance.repository;

import com.careerguidance.model.Internship;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipRepository extends MongoRepository<Internship, String> {
    List<Internship> findByWorkMode(String workMode);
}
