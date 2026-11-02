package com.resqnet.service;

import com.resqnet.dto.task.CreateTaskRequest;
import com.resqnet.dto.task.UpdateTaskStatusRequest;
import com.resqnet.dto.task.VolunteerTaskResponse;
import com.resqnet.enums.TaskCategory;
import com.resqnet.enums.TaskPriority;
import com.resqnet.enums.TaskStatus;

import java.util.List;

public interface TaskService {
    VolunteerTaskResponse createTask(CreateTaskRequest request, String creatorEmail);
    List<VolunteerTaskResponse> getAllTasks(TaskStatus status, TaskPriority priority, TaskCategory category);
    List<VolunteerTaskResponse> getAvailableTasks(Double lat, Double lon, Double radiusKm);
    List<VolunteerTaskResponse> getMyAssignedTasks(String volunteerEmail);
    VolunteerTaskResponse getTaskById(Long id, Double userLat, Double userLon);
    VolunteerTaskResponse assignTask(Long taskId, String volunteerEmail);
    VolunteerTaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, String userEmail);
    VolunteerTaskResponse completeTask(Long taskId, String completionNotes, String volunteerEmail);
}
