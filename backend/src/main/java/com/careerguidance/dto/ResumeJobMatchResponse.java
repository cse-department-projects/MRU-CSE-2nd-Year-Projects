package com.careerguidance.dto;

import java.util.List;

public class ResumeJobMatchResponse {
    private Integer overallMatchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> matchingKeywords;
    private List<String> missingKeywords;
    private String educationMatchStatus;
    private String experienceMatchStatus;
    private List<String> recommendations;

    public ResumeJobMatchResponse() {}

    public Integer getOverallMatchPercentage() { return overallMatchPercentage; }
    public void setOverallMatchPercentage(Integer overallMatchPercentage) { this.overallMatchPercentage = overallMatchPercentage; }
    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public List<String> getMatchingKeywords() { return matchingKeywords; }
    public void setMatchingKeywords(List<String> matchingKeywords) { this.matchingKeywords = matchingKeywords; }
    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }
    public String getEducationMatchStatus() { return educationMatchStatus; }
    public void setEducationMatchStatus(String educationMatchStatus) { this.educationMatchStatus = educationMatchStatus; }
    public String getExperienceMatchStatus() { return experienceMatchStatus; }
    public void setExperienceMatchStatus(String experienceMatchStatus) { this.experienceMatchStatus = experienceMatchStatus; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
