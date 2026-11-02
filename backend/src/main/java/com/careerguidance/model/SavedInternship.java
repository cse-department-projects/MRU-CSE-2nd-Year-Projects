package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "saved_internships")
public class SavedInternship {

    @Id
    private String id;
    private String userId;
    private String internshipId;
    private LocalDateTime savedAt = LocalDateTime.now();

    public SavedInternship() {}

    public SavedInternship(String userId, String internshipId) {
        this.userId = userId;
        this.internshipId = internshipId;
        this.savedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getInternshipId() { return internshipId; }
    public void setInternshipId(String internshipId) { this.internshipId = internshipId; }
    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
}
