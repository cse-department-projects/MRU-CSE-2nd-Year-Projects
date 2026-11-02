package com.careerguidance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "internships")
public class Internship {

    @Id
    private String id;
    private String title;
    private String company;
    private String location;
    private String duration; // 3 Months, 6 Months
    private String stipend; // e.g. "₹25,000 / month", "$1,500 / month"
    private List<String> skills = new ArrayList<>();
    private String workMode; // Remote, Hybrid, Onsite
    private String description;
    private String applicationUrl;
    private String postedDate = LocalDate.now().toString();

    public Internship() {}

    public Internship(String id, String title, String company, String location, String duration, String stipend, List<String> skills, String workMode, String description, String applicationUrl, String postedDate) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.duration = duration;
        this.stipend = stipend;
        this.skills = skills;
        this.workMode = workMode;
        this.description = description;
        this.applicationUrl = applicationUrl;
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
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getStipend() { return stipend; }
    public void setStipend(String stipend) { this.stipend = stipend; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getApplicationUrl() { return applicationUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applicationUrl = applicationUrl; }
    public String getPostedDate() { return postedDate; }
    public void setPostedDate(String postedDate) { this.postedDate = postedDate; }
}
