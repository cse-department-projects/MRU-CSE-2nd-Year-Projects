package com.resqnet.dto.volunteer;

public class LeaderboardEntryResponse {

    private Long userId;
    private String fullName;
    private Integer totalPoints;
    private Integer tasksCompleted;
    private String currentTier;
    private Boolean isVerified;
    private Integer rank;

    public LeaderboardEntryResponse() {
    }

    public LeaderboardEntryResponse(Long userId, String fullName, Integer totalPoints, Integer tasksCompleted, String currentTier, Boolean isVerified, Integer rank) {
        this.userId = userId;
        this.fullName = fullName;
        this.totalPoints = totalPoints;
        this.tasksCompleted = tasksCompleted;
        this.currentTier = currentTier;
        this.isVerified = isVerified;
        this.rank = rank;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    public Integer getTasksCompleted() {
        return tasksCompleted;
    }

    public void setTasksCompleted(Integer tasksCompleted) {
        this.tasksCompleted = tasksCompleted;
    }

    public String getCurrentTier() {
        return currentTier;
    }

    public void setCurrentTier(String currentTier) {
        this.currentTier = currentTier;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}
