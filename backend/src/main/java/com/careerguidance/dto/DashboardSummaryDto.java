package com.careerguidance.dto;

import com.careerguidance.model.Career;
import com.careerguidance.model.UserSkill;

import java.util.List;

public class DashboardSummaryDto {
    private String userName;
    private String userEmail;
    private Integer profileCompletion;
    private Integer totalSkillsCount;
    private Integer activeSkillGapsCount;
    private Integer roadmapProgressPercentage;
    private Integer latestAtsScore;
    private Integer savedOpportunitiesCount;
    private CareerMatchDto recommendedCareer;
    private List<CareerMatchDto> topCareers;
    private List<UserSkill> recentSkills;
    private List<JobDto> recommendedJobs;
    private List<InternshipDto> recommendedInternships;

    public DashboardSummaryDto() {}

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public Integer getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(Integer profileCompletion) { this.profileCompletion = profileCompletion; }
    public Integer getTotalSkillsCount() { return totalSkillsCount; }
    public void setTotalSkillsCount(Integer totalSkillsCount) { this.totalSkillsCount = totalSkillsCount; }
    public Integer getActiveSkillGapsCount() { return activeSkillGapsCount; }
    public void setActiveSkillGapsCount(Integer activeSkillGapsCount) { this.activeSkillGapsCount = activeSkillGapsCount; }
    public Integer getRoadmapProgressPercentage() { return roadmapProgressPercentage; }
    public void setRoadmapProgressPercentage(Integer roadmapProgressPercentage) { this.roadmapProgressPercentage = roadmapProgressPercentage; }
    public Integer getLatestAtsScore() { return latestAtsScore; }
    public void setLatestAtsScore(Integer latestAtsScore) { this.latestAtsScore = latestAtsScore; }
    public Integer getSavedOpportunitiesCount() { return savedOpportunitiesCount; }
    public void setSavedOpportunitiesCount(Integer savedOpportunitiesCount) { this.savedOpportunitiesCount = savedOpportunitiesCount; }
    public CareerMatchDto getRecommendedCareer() { return recommendedCareer; }
    public void setRecommendedCareer(CareerMatchDto recommendedCareer) { this.recommendedCareer = recommendedCareer; }
    public List<CareerMatchDto> getTopCareers() { return topCareers; }
    public void setTopCareers(List<CareerMatchDto> topCareers) { this.topCareers = topCareers; }
    public List<UserSkill> getRecentSkills() { return recentSkills; }
    public void setRecentSkills(List<UserSkill> recentSkills) { this.recentSkills = recentSkills; }
    public List<JobDto> getRecommendedJobs() { return recommendedJobs; }
    public void setRecommendedJobs(List<JobDto> recommendedJobs) { this.recommendedJobs = recommendedJobs; }
    public List<InternshipDto> getRecommendedInternships() { return recommendedInternships; }
    public void setRecommendedInternships(List<InternshipDto> recommendedInternships) { this.recommendedInternships = recommendedInternships; }
}
