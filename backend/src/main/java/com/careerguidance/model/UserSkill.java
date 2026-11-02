package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_skills")
public class UserSkill {

    @Id
    private String id;
    private String userId;
    private String skillName;
    private String category;
    private String proficiency = "Intermediate"; // Beginner, Intermediate, Advanced
    private LocalDateTime addedAt = LocalDateTime.now();

    public UserSkill() {}

    public UserSkill(String userId, String skillName, String category, String proficiency) {
        this.userId = userId;
        this.skillName = skillName;
        this.category = category;
        this.proficiency = proficiency;
        this.addedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getProficiency() { return proficiency; }
    public void setProficiency(String proficiency) { this.proficiency = proficiency; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
