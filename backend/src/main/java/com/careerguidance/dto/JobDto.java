package com.careerguidance.dto;

import com.careerguidance.model.Job;

import java.util.List;

public class JobDto {
    private Job job;
    private Integer matchPercentage;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private boolean isSaved;

    public JobDto() {}

    public JobDto(Job job, Integer matchPercentage, List<String> matchingSkills, List<String> missingSkills, boolean isSaved) {
        this.job = job;
        this.matchPercentage = matchPercentage;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.isSaved = isSaved;
    }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }
    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public boolean isSaved() { return isSaved; }
    public void setSaved(boolean saved) { isSaved = saved; }
}
