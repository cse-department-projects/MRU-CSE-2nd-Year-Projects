package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "jobs")
public class Job {

    @Id
    private String id;
    private String title;
    private String company;
    private String location;
    private String workMode; // Remote, Hybrid, Onsite
    private String experience; // Fresher, 1-3 years, etc.
    private List<String> skills = new ArrayList<>();
    private String description;
    private String applicationUrl;
    private String salary;
    private String category; // Full-Time, Contract
    private String postedDate = LocalDate.now().toString();

    public Job() {}

    public Job(String id, String title, String company, String location, String workMode, String experience, List<String> skills, String description, String applicationUrl, String salary, String category, String postedDate) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.workMode = workMode;
        this.experience = experience;
        this.skills = skills;
        this.description = description;
        this.applicationUrl = applicationUrl;
        this.salary = salary;
        this.category = category;
        this.postedDate = postedDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getApplicationUrl() { return applicationUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applicationUrl = applicationUrl; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPostedDate() { return postedDate; }
    public void setPostedDate(String postedDate) { this.postedDate = postedDate; }
}
