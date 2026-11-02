package com.careerguidance.dto;

import com.careerguidance.model.Internship;

import java.util.List;

public class InternshipDto {
    private Internship internship;
    private Integer matchPercentage;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private boolean isSaved;

    public InternshipDto() {}

    public InternshipDto(Internship internship, Integer matchPercentage, List<String> matchingSkills, List<String> missingSkills, boolean isSaved) {
        this.internship = internship;
        this.matchPercentage = matchPercentage;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.isSaved = isSaved;
    }

    public Internship getInternship() { return internship; }
    public void setInternship(Internship internship) { this.internship = internship; }
    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }
    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
    public boolean isSaved() { return isSaved; }
    public void setSaved(boolean saved) { isSaved = saved; }
}
