package com.careerguidance.repository;

import com.careerguidance.model.Career;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerRepository extends MongoRepository<Career, String> {
    List<Career> findByDomain(String domain);
}
