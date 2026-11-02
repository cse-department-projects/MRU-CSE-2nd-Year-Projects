package com.careerguidance.service;

import com.careerguidance.dto.JobDto;
import com.careerguidance.model.Job;
import com.careerguidance.model.SavedJob;
import com.careerguidance.model.User;
import com.careerguidance.model.UserSkill;
import com.careerguidance.repository.JobRepository;
import com.careerguidance.repository.SavedJobRepository;
import com.careerguidance.repository.UserRepository;
import com.careerguidance.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final MatchingEngineService matchingEngineService;

    public JobService(
            JobRepository jobRepository,
            SavedJobRepository savedJobRepository,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            MatchingEngineService matchingEngineService
    ) {
        this.jobRepository = jobRepository;
        this.savedJobRepository = savedJobRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.matchingEngineService = matchingEngineService;
    }

    public List<JobDto> getJobs(String userEmail, String search, String workMode, String location, Integer minMatch) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());

        Set<String> savedJobIds = savedJobRepository.findByUserId(user.getId()).stream()
                .map(SavedJob::getJobId).collect(Collectors.toSet());

        return jobRepository.findAll().stream()
                .map(job -> matchingEngineService.matchJob(user, job, skillNames, savedJobIds.contains(job.getId())))
                .filter(dto -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase().trim();
                        boolean matchesTitle = dto.getJob().getTitle().toLowerCase().contains(s);
                        boolean matchesCompany = dto.getJob().getCompany().toLowerCase().contains(s);
                        boolean matchesSkill = dto.getJob().getSkills().stream().anyMatch(sk -> sk.toLowerCase().contains(s));
                        if (!matchesTitle && !matchesCompany && !matchesSkill) return false;
                    }
                    if (workMode != null && !workMode.equalsIgnoreCase("All") && !workMode.isEmpty()) {
                        if (!dto.getJob().getWorkMode().equalsIgnoreCase(workMode)) return false;
                    }
                    if (location != null && !location.equalsIgnoreCase("All") && !location.isEmpty()) {
                        if (!dto.getJob().getLocation().toLowerCase().contains(location.toLowerCase())) return false;
                    }
                    if (minMatch != null && minMatch > 0) {
                        if (dto.getMatchPercentage() < minMatch) return false;
                    }
                    return true;
                })
                .sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()))
                .collect(Collectors.toList());
    }

    public List<JobDto> getRecommendedJobs(String userEmail) {
        return getJobs(userEmail, null, null, null, 0).stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    public JobDto saveJob(String userEmail, String jobId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (savedJobRepository.findByUserIdAndJobId(user.getId(), jobId).isEmpty()) {
            savedJobRepository.save(new SavedJob(user.getId(), jobId));
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new IllegalArgumentException("Job not found"));
        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());
        return matchingEngineService.matchJob(user, job, skillNames, true);
    }

    public void unsaveJob(String userEmail, String jobId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        savedJobRepository.deleteByUserIdAndJobId(user.getId(), jobId);
    }

    public List<JobDto> getSavedJobs(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<SavedJob> saved = savedJobRepository.findByUserId(user.getId());
        Set<String> savedIds = saved.stream().map(SavedJob::getJobId).collect(Collectors.toSet());

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = skills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());

        return jobRepository.findAll().stream()
                .filter(j -> savedIds.contains(j.getId()))
                .map(j -> matchingEngineService.matchJob(user, j, skillNames, true))
                .collect(Collectors.toList());
    }
}
