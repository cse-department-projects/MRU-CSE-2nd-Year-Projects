package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "learning_resources")
public class LearningResource {

    @Id
    private String id;
    private String title;
    private String platform; // Coursera, Udemy, YouTube, freeCodeCamp, Official Docs, LeetCode
    private String url;
    private String skillName;
    private String difficulty; // Beginner, Intermediate, Advanced
    private String estimatedDuration;
    private String type; // Course, Video, Tutorial, Practice, Documentation

    public LearningResource() {}

    public LearningResource(String id, String title, String platform, String url, String skillName, String difficulty, String estimatedDuration, String type) {
        this.id = id;
        this.title = title;
        this.platform = platform;
        this.url = url;
        this.skillName = skillName;
        this.difficulty = difficulty;
        this.estimatedDuration = estimatedDuration;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(String estimatedDuration) { this.estimatedDuration = estimatedDuration; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
