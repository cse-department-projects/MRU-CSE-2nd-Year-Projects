package com.resqnet.service.impl;

import com.resqnet.dto.task.CreateTaskRequest;
import com.resqnet.dto.task.UpdateTaskStatusRequest;
import com.resqnet.dto.task.VolunteerTaskResponse;
import com.resqnet.entity.DisasterReport;
import com.resqnet.entity.User;
import com.resqnet.entity.VolunteerTask;
import com.resqnet.enums.NotificationType;
import com.resqnet.enums.TaskCategory;
import com.resqnet.enums.TaskPriority;
import com.resqnet.enums.TaskStatus;
import com.resqnet.exception.BadRequestException;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.DisasterReportRepository;
import com.resqnet.repository.UserRepository;
import com.resqnet.repository.VolunteerTaskRepository;
import com.resqnet.service.NotificationService;
import com.resqnet.service.TaskService;
import com.resqnet.service.VolunteerService;
import com.resqnet.util.GeoUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final VolunteerTaskRepository volunteerTaskRepository;
    private final UserRepository userRepository;
    private final DisasterReportRepository disasterReportRepository;
    private final VolunteerService volunteerService;
    private final NotificationService notificationService;

    public TaskServiceImpl(
            VolunteerTaskRepository volunteerTaskRepository,
            UserRepository userRepository,
            DisasterReportRepository disasterReportRepository,
            VolunteerService volunteerService,
            NotificationService notificationService) {
        this.volunteerTaskRepository = volunteerTaskRepository;
        this.userRepository = userRepository;
        this.disasterReportRepository = disasterReportRepository;
        this.volunteerService = volunteerService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public VolunteerTaskResponse createTask(CreateTaskRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + creatorEmail));

        VolunteerTask task = new VolunteerTask();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription().trim());
        task.setCategory(request.getCategory() != null ? request.getCategory() : TaskCategory.LOGISTICS);
        task.setPriority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM);
        task.setStatus(TaskStatus.OPEN);
        task.setPointsReward(request.getPointsReward() != null && request.getPointsReward() > 0 ? request.getPointsReward() : 50);
        task.setLatitude(request.getLatitude());
        task.setLongitude(request.getLongitude());
        task.setLocationName(request.getLocationName().trim());
        task.setContactPhone(request.getContactPhone());
        task.setCreatedBy(creator);

        if (request.getRelatedDisasterId() != null) {
            DisasterReport disaster = disasterReportRepository.findById(request.getRelatedDisasterId()).orElse(null);
            task.setRelatedDisaster(disaster);
        }

        VolunteerTask saved = volunteerTaskRepository.save(task);
        return mapToResponse(saved, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskResponse> getAllTasks(TaskStatus status, TaskPriority priority, TaskCategory category) {
        List<VolunteerTask> tasks;
        if (status != null) {
            tasks = volunteerTaskRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            tasks = volunteerTaskRepository.findAllByOrderByCreatedAtDesc();
        }

        return tasks.stream()
                .filter(t -> priority == null || t.getPriority() == priority)
                .filter(t -> category == null || t.getCategory() == category)
                .map(t -> mapToResponse(t, null, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskResponse> getAvailableTasks(Double lat, Double lon, Double radiusKm) {
        List<VolunteerTask> openTasks = volunteerTaskRepository.findByStatusOrderByCreatedAtDesc(TaskStatus.OPEN);

        if (lat == null || lon == null) {
            return openTasks.stream().map(t -> mapToResponse(t, null, null)).collect(Collectors.toList());
        }

        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 30.0;

        return openTasks.stream()
                .filter(t -> {
                    if (t.getLatitude() == null || t.getLongitude() == null) return false;
                    double dist = GeoUtils.calculateDistanceKm(lat, lon, t.getLatitude(), t.getLongitude());
                    return dist <= maxRadius;
                })
                .sorted(Comparator.comparingDouble(t ->
                        GeoUtils.calculateDistanceKm(lat, lon, t.getLatitude(), t.getLongitude())))
                .map(t -> mapToResponse(t, lat, lon))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskResponse> getMyAssignedTasks(String volunteerEmail) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + volunteerEmail));

        List<VolunteerTask> tasks = volunteerTaskRepository.findByAssignedVolunteerIdOrderByCreatedAtDesc(volunteer.getId());
        return tasks.stream().map(t -> mapToResponse(t, null, null)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerTaskResponse getTaskById(Long id, Double userLat, Double userLon) {
        VolunteerTask task = volunteerTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        return mapToResponse(task, userLat, userLon);
    }

    @Override
    @Transactional
    public VolunteerTaskResponse assignTask(Long taskId, String volunteerEmail) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + volunteerEmail));

        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.getStatus() != TaskStatus.OPEN && task.getStatus() != TaskStatus.CANCELLED) {
            throw new BadRequestException("Task is already claimed or in progress by another responder.");
        }

        task.setAssignedVolunteer(volunteer);
        task.setStatus(TaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());

        VolunteerTask saved = volunteerTaskRepository.save(task);

        // Notify volunteer
        notificationService.sendNotification(
                volunteer,
                "Relief Task Claimed: " + task.getTitle(),
                "You have been assigned to task #" + task.getId() + " at " + task.getLocationName() + ". Proceed when ready.",
                NotificationType.TASK_ASSIGNED,
                "/volunteer/tasks"
        );

        return mapToResponse(saved, null, null);
    }

    @Override
    @Transactional
    public VolunteerTaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, String userEmail) {
        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        task.setStatus(request.getStatus());
        if (request.getCompletionNotes() != null) {
            task.setCompletionNotes(request.getCompletionNotes());
        }

        VolunteerTask saved = volunteerTaskRepository.save(task);
        return mapToResponse(saved, null, null);
    }

    @Override
    @Transactional
    public VolunteerTaskResponse completeTask(Long taskId, String completionNotes, String volunteerEmail) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + volunteerEmail));

        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new BadRequestException("Task is already marked as completed.");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        if (completionNotes != null) {
            task.setCompletionNotes(completionNotes.trim());
        }

        VolunteerTask saved = volunteerTaskRepository.save(task);

        // Award points & increase task count for the volunteer
        if (task.getAssignedVolunteer() != null) {
            volunteerService.awardTaskPoints(task.getAssignedVolunteer().getId(), task.getPointsReward());

            // Send award notification
            notificationService.sendNotification(
                    task.getAssignedVolunteer(),
                    "Task Completed! +" + task.getPointsReward() + " Points",
                    "Congratulations! You completed '" + task.getTitle() + "' and earned " + task.getPointsReward() + " reward points.",
                    NotificationType.REWARD_EARNED,
                    "/volunteer/rewards"
            );
        }

        return mapToResponse(saved, null, null);
    }

    private VolunteerTaskResponse mapToResponse(VolunteerTask task, Double userLat, Double userLon) {
        VolunteerTaskResponse res = new VolunteerTaskResponse();
        res.setId(task.getId());
        res.setTitle(task.getTitle());
        res.setDescription(task.getDescription());
        res.setCategory(task.getCategory());
        res.setPriority(task.getPriority());
        res.setStatus(task.getStatus());
        res.setPointsReward(task.getPointsReward());
        res.setLatitude(task.getLatitude());
        res.setLongitude(task.getLongitude());
        res.setLocationName(task.getLocationName());
        res.setContactPhone(task.getContactPhone());

        if (task.getCreatedBy() != null) {
            res.setCreatedById(task.getCreatedBy().getId());
            res.setCreatedByName(task.getCreatedBy().getFullName());
        }

        if (task.getAssignedVolunteer() != null) {
            res.setAssignedVolunteerId(task.getAssignedVolunteer().getId());
            res.setAssignedVolunteerName(task.getAssignedVolunteer().getFullName());
        }

        if (task.getRelatedDisaster() != null) {
            res.setRelatedDisasterId(task.getRelatedDisaster().getId());
        }

        if (userLat != null && userLon != null && task.getLatitude() != null && task.getLongitude() != null) {
            double dist = GeoUtils.calculateDistanceKm(userLat, userLon, task.getLatitude(), task.getLongitude());
            res.setDistanceKm(Math.round(dist * 100.0) / 100.0);
        }

        res.setAssignedAt(task.getAssignedAt());
        res.setCompletedAt(task.getCompletedAt());
        res.setCompletionNotes(task.getCompletionNotes());
        res.setCreatedAt(task.getCreatedAt());
        res.setUpdatedAt(task.getUpdatedAt());
        return res;
    }
}
