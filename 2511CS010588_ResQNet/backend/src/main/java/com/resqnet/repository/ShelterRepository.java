package com.resqnet.repository;

import com.resqnet.entity.Shelter;
import com.resqnet.enums.ShelterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {
    List<Shelter> findAllByOrderByCreatedAtDesc();
    List<Shelter> findByStatus(ShelterStatus status);
}
