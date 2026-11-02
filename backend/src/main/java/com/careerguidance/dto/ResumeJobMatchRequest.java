package com.careerguidance.dto;

import java.util.List;

public class ResumeJobMatchRequest {
    private String resumeText;
    private String jobDescription;
    private String targetJobTitle;

    public ResumeJobMatchRequest() {}

    public ResumeJobMatchRequest(String resumeText, String jobDescription, String targetJobTitle) {
        this.resumeText = resumeText;
        this.jobDescription = jobDescription;
        this.targetJobTitle = targetJobTitle;
    }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public String getTargetJobTitle() { return targetJobTitle; }
    public void setTargetJobTitle(String targetJobTitle) { this.targetJobTitle = targetJobTitle; }
}
