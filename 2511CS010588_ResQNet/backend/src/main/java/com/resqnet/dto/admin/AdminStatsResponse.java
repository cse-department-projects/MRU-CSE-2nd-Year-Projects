package com.resqnet.dto.admin;

public class AdminStatsResponse {

    private long totalUsers;
    private long totalCitizens;
    private long totalVolunteers;
    private long totalRescueTeams;
    private long activeUsers;
    private long activeSosCount;
    private long verifiedDisasterCount;
    private long openShelterCount;
    private long operationalHospitalsCount;
    private long totalAvailableBeds;
    private long totalTasks;
    private long activeTasks;
    private long completedTasks;

    public AdminStatsResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCitizens() {
        return totalCitizens;
    }

    public void setTotalCitizens(long totalCitizens) {
        this.totalCitizens = totalCitizens;
    }

    public long getTotalVolunteers() {
        return totalVolunteers;
    }

    public void setTotalVolunteers(long totalVolunteers) {
        this.totalVolunteers = totalVolunteers;
    }

    public long getTotalRescueTeams() {
        return totalRescueTeams;
    }

    public void setTotalRescueTeams(long totalRescueTeams) {
        this.totalRescueTeams = totalRescueTeams;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getActiveSosCount() {
        return activeSosCount;
    }

    public void setActiveSosCount(long activeSosCount) {
        this.activeSosCount = activeSosCount;
    }

    public long getVerifiedDisasterCount() {
        return verifiedDisasterCount;
    }

    public void setVerifiedDisasterCount(long verifiedDisasterCount) {
        this.verifiedDisasterCount = verifiedDisasterCount;
    }

    public long getOpenShelterCount() {
        return openShelterCount;
    }

    public void setOpenShelterCount(long openShelterCount) {
        this.openShelterCount = openShelterCount;
    }

    public long getOperationalHospitalsCount() {
        return operationalHospitalsCount;
    }

    public void setOperationalHospitalsCount(long operationalHospitalsCount) {
        this.operationalHospitalsCount = operationalHospitalsCount;
    }

    public long getTotalAvailableBeds() {
        return totalAvailableBeds;
    }

    public void setTotalAvailableBeds(long totalAvailableBeds) {
        this.totalAvailableBeds = totalAvailableBeds;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getActiveTasks() {
        return activeTasks;
    }

    public void setActiveTasks(long activeTasks) {
        this.activeTasks = activeTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }
}
