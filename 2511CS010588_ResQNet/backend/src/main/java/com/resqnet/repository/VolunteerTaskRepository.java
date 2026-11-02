package com.resqnet.repository;

import com.resqnet.entity.VolunteerTask;
import com.resqnet.enums.TaskCategory;
import com.resqnet.enums.TaskPriority;
import com.resqnet.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerTaskRepository extends JpaRepository<VolunteerTask, Long> {
    List<VolunteerTask> findAllByOrderByCreatedAtDesc();
    List<VolunteerTask> findByStatusOrderByCreatedAtDesc(TaskStatus status);
    List<VolunteerTask> findByAssignedVolunteerIdOrderByCreatedAtDesc(Long volunteerUserId);
    List<VolunteerTask> findByCreatedByIdOrderByCreatedAtDesc(Long creatorId);
    long countByStatus(TaskStatus status);
}
