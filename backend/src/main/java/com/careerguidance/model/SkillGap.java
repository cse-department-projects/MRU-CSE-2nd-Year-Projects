package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "skill_gaps")
public class SkillGap {

    @Id
    private String id;
    private String userId;
    private String careerId;
    private String careerTitle;
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> userSkills = new ArrayList<>();
    private List<String> matchedSkills = new ArrayList<>();
    private List<MissingSkillDetail> missingSkills = new ArrayList<>();
    private Integer matchPercentage;
    private LocalDateTime analyzedAt = LocalDateTime.now();

    public SkillGap() {}

    public static class MissingSkillDetail {
        private String skillName;
        private String importance; // High, Medium, Foundational
        private String whyRequired;
        private String recommendedResource;
        private String estimatedDuration;
        private String roadmapPosition;

        public MissingSkillDetail() {}

        public MissingSkillDetail(String skillName, String importance, String whyRequired, String recommendedResource, String estimatedDuration, String roadmapPosition) {
            this.skillName = skillName;
            this.importance = importance;
            this.whyRequired = whyRequired;
            this.recommendedResource = recommendedResource;
            this.estimatedDuration = estimatedDuration;
            this.roadmapPosition = roadmapPosition;
        }

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public String getImportance() { return importance; }
        public void setImportance(String importance) { this.importance = importance; }
        public String getWhyRequired() { return whyRequired; }
        public void setWhyRequired(String whyRequired) { this.whyRequired = whyRequired; }
        public String getRecommendedResource() { return recommendedResource; }
        public void setRecommendedResource(String recommendedResource) { this.recommendedResource = recommendedResource; }
        public String getEstimatedDuration() { return estimatedDuration; }
        public void setEstimatedDuration(String estimatedDuration) { this.estimatedDuration = estimatedDuration; }
        public String getRoadmapPosition() { return roadmapPosition; }
        public void setRoadmapPosition(String roadmapPosition) { this.roadmapPosition = roadmapPosition; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCareerId() { return careerId; }
    public void setCareerId(String careerId) { this.careerId = careerId; }
    public String getCareerTitle() { return careerTitle; }
    public void setCareerTitle(String careerTitle) { this.careerTitle = careerTitle; }
    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }
    public List<String> getUserSkills() { return userSkills; }
    public void setUserSkills(List<String> userSkills) { this.userSkills = userSkills; }
    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }
    public List<MissingSkillDetail> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<MissingSkillDetail> missingSkills) { this.missingSkills = missingSkills; }
    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}
