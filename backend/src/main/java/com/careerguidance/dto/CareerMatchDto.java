package com.careerguidance.dto;

import com.careerguidance.model.Career;

import java.util.List;

public class CareerMatchDto {
    private Career career;
    private Integer matchPercentage;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private String matchReason;

    public CareerMatchDto() {}

    public CareerMatchDto(Career career, Integer matchPercentage, List<String> matchingSkills, List<String> missingSkills, String matchReason) {
        this.career = career;
        this.matchPercentage = matchPercentage;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.matchReason = matchReason;
    }

    public Career getCareer() { return career; }
    public void setCareer(Career career) { this.career = career; }
    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }
    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
}
