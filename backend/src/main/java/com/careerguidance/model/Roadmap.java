package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "roadmaps")
public class Roadmap {

    @Id
    private String id;
    private String userId;
    private String careerId;
    private String careerTitle;
    private List<RoadmapPhase> phases = new ArrayList<>();
    private Integer progressPercentage = 0;
    private List<String> completedTasks = new ArrayList<>();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Roadmap() {}

    public static class RoadmapPhase {
        private String phaseId;
        private String title;
        private String description;
        private String estimatedDuration;
        private List<String> skills = new ArrayList<>();
        private List<RoadmapTask> tasks = new ArrayList<>();
        private List<String> resources = new ArrayList<>();

        public RoadmapPhase() {}

        public RoadmapPhase(String phaseId, String title, String description, String estimatedDuration, List<String> skills, List<RoadmapTask> tasks, List<String> resources) {
            this.phaseId = phaseId;
            this.title = title;
            this.description = description;
            this.estimatedDuration = estimatedDuration;
            this.skills = skills;
            this.tasks = tasks;
            this.resources = resources;
        }

        public String getPhaseId() { return phaseId; }
        public void setPhaseId(String phaseId) { this.phaseId = phaseId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEstimatedDuration() { return estimatedDuration; }
        public void setEstimatedDuration(String estimatedDuration) { this.estimatedDuration = estimatedDuration; }
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
        public List<RoadmapTask> getTasks() { return tasks; }
        public void setTasks(List<RoadmapTask> tasks) { this.tasks = tasks; }
        public List<String> getResources() { return resources; }
        public void setResources(List<String> resources) { this.resources = resources; }
    }

    public static class RoadmapTask {
        private String taskId;
        private String title;
        private boolean completed;

        public RoadmapTask() {}

        public RoadmapTask(String taskId, String title, boolean completed) {
            this.taskId = taskId;
            this.title = title;
            this.completed = completed;
        }

        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCareerId() { return careerId; }
    public void setCareerId(String careerId) { this.careerId = careerId; }
    public String getCareerTitle() { return careerTitle; }
    public void setCareerTitle(String careerTitle) { this.careerTitle = careerTitle; }
    public List<RoadmapPhase> getPhases() { return phases; }
    public void setPhases(List<RoadmapPhase> phases) { this.phases = phases; }
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    public List<String> getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(List<String> completedTasks) { this.completedTasks = completedTasks; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
