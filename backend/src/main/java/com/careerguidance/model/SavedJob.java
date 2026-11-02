package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "saved_jobs")
public class SavedJob {

    @Id
    private String id;
    private String userId;
    private String jobId;
    private LocalDateTime savedAt = LocalDateTime.now();

    public SavedJob() {}

    public SavedJob(String userId, String jobId) {
        this.userId = userId;
        this.jobId = jobId;
        this.savedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
}
