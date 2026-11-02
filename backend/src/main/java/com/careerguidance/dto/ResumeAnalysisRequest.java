package com.careerguidance.dto;

import java.util.List;

public class ResumeAnalysisRequest {
    private String resumeText;
    private String fileName;

    public ResumeAnalysisRequest() {}

    public ResumeAnalysisRequest(String resumeText, String fileName) {
        this.resumeText = resumeText;
        this.fileName = fileName;
    }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}
