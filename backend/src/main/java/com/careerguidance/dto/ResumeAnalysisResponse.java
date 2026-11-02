package com.careerguidance.dto;

import java.util.List;

public class ResumeAnalysisResponse {
    private String id;
    private String fileName;
    private Integer atsScore; // 0-100
    private List<String> extractedSkills;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingKeywords;
    private List<String> suggestions;

    public ResumeAnalysisResponse() {}

    public ResumeAnalysisResponse(String id, String fileName, Integer atsScore, List<String> extractedSkills, List<String> strengths, List<String> weaknesses, List<String> missingKeywords, List<String> suggestions) {
        this.id = id;
        this.fileName = fileName;
        this.atsScore = atsScore;
        this.extractedSkills = extractedSkills;
        this.strengths = strengths;
        this.weaknesses = weaknesses;
        this.missingKeywords = missingKeywords;
        this.suggestions = suggestions;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }
    public List<String> getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(List<String> extractedSkills) { this.extractedSkills = extractedSkills; }
    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }
    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }
    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
}
