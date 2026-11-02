package com.careerguidance.repository;

import com.careerguidance.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByCategory(String category);
    List<Job> findByWorkMode(String workMode);
}
