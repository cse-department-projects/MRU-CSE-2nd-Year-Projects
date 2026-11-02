package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "careers")
public class Career {

    @Id
    private String id;
    private String title;
    private String description;
    private String domain;
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> preferredSkills = new ArrayList<>();
    private String salaryRange;
    private String experienceLevel;
    private List<String> responsibilities = new ArrayList<>();
    private List<String> careerProgression = new ArrayList<>();
    private String iconName;

    public Career() {}

    public Career(String id, String title, String description, String domain, List<String> requiredSkills, List<String> preferredSkills, String salaryRange, String experienceLevel, List<String> responsibilities, List<String> careerProgression, String iconName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.domain = domain;
        this.requiredSkills = requiredSkills;
        this.preferredSkills = preferredSkills;
        this.salaryRange = salaryRange;
        this.experienceLevel = experienceLevel;
        this.responsibilities = responsibilities;
        this.careerProgression = careerProgression;
        this.iconName = iconName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }
    public List<String> getPreferredSkills() { return preferredSkills; }
    public void setPreferredSkills(List<String> preferredSkills) { this.preferredSkills = preferredSkills; }
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }
    public List<String> getCareerProgression() { return careerProgression; }
    public void setCareerProgression(List<String> careerProgression) { this.careerProgression = careerProgression; }
    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }
}
