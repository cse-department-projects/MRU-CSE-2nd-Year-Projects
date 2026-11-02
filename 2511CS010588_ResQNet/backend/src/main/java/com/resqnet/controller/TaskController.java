package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import com.resqnet.dto.task.CreateTaskRequest;
import com.resqnet.dto.task.UpdateTaskStatusRequest;
import com.resqnet.dto.task.VolunteerTaskResponse;
import com.resqnet.enums.TaskCategory;
import com.resqnet.enums.TaskPriority;
import com.resqnet.enums.TaskStatus;
import com.resqnet.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESCUE_TEAM', 'ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        VolunteerTaskResponse created = taskService.createTask(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Relief task dispatched successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VolunteerTaskResponse>>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) TaskCategory category) {
        List<VolunteerTaskResponse> tasks = taskService.getAllTasks(status, priority, category);
        return ResponseEntity.ok(ApiResponse.ok(tasks, "Relief tasks retrieved successfully"));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VolunteerTaskResponse>>> getAvailableTasks(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false, defaultValue = "30.0") Double radiusKm) {
        List<VolunteerTaskResponse> tasks = taskService.getAvailableTasks(lat, lon, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(tasks, "Available open tasks retrieved successfully"));
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<VolunteerTaskResponse>>> getMyAssignedTasks(Authentication authentication) {
        List<VolunteerTaskResponse> tasks = taskService.getMyAssignedTasks(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(tasks, "Your assigned relief tasks retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> getTaskById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        VolunteerTaskResponse task = taskService.getTaskById(id, lat, lon);
        return ResponseEntity.ok(ApiResponse.ok(task, "Task details retrieved successfully"));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> assignTask(
            @PathVariable Long id,
            Authentication authentication) {
        VolunteerTaskResponse task = taskService.assignTask(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(task, "Task successfully claimed and assigned to you"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication) {
        VolunteerTaskResponse task = taskService.updateTaskStatus(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(task, "Task status updated successfully"));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN', 'RESCUE_TEAM')")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> completeTask(
            @PathVariable Long id,
            @RequestParam(required = false) String completionNotes,
            Authentication authentication) {
        VolunteerTaskResponse task = taskService.completeTask(id, completionNotes, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(task, "Task marked as COMPLETED! Reward points credited."));
    }
}
