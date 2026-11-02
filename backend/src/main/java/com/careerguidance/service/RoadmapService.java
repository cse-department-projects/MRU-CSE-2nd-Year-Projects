package com.careerguidance.service;

import com.careerguidance.model.Career;
import com.careerguidance.model.Roadmap;
import com.careerguidance.model.Roadmap.RoadmapPhase;
import com.careerguidance.model.Roadmap.RoadmapTask;
import com.careerguidance.model.User;
import com.careerguidance.repository.CareerRepository;
import com.careerguidance.repository.RoadmapRepository;
import com.careerguidance.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final CareerRepository careerRepository;
    private final UserRepository userRepository;

    public RoadmapService(
            RoadmapRepository roadmapRepository,
            CareerRepository careerRepository,
            UserRepository userRepository
    ) {
        this.roadmapRepository = roadmapRepository;
        this.careerRepository = careerRepository;
        this.userRepository = userRepository;
    }

    public List<Roadmap> getUserRoadmaps(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return roadmapRepository.findByUserId(user.getId());
    }

    public Roadmap getRoadmapByCareer(String userEmail, String careerId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return roadmapRepository.findByUserIdAndCareerId(user.getId(), careerId)
                .orElseGet(() -> startRoadmap(userEmail, careerId));
    }

    public Roadmap startRoadmap(String userEmail, String careerId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new IllegalArgumentException("Career not found"));

        Optional<Roadmap> existing = roadmapRepository.findByUserIdAndCareerId(user.getId(), careerId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Roadmap roadmap = new Roadmap();
        roadmap.setUserId(user.getId());
        roadmap.setCareerId(careerId);
        roadmap.setCareerTitle(career.getTitle());
        roadmap.setProgressPercentage(0);
        roadmap.setCompletedTasks(new ArrayList<>());
        roadmap.setPhases(generatePhasesForCareer(career));
        roadmap.setUpdatedAt(LocalDateTime.now());

        return roadmapRepository.save(roadmap);
    }

    public Roadmap toggleTask(String userEmail, String roadmapId, String taskId) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap not found"));

        int totalTasks = 0;
        int completedCount = 0;
        List<String> completedList = new ArrayList<>(roadmap.getCompletedTasks());

        for (RoadmapPhase phase : roadmap.getPhases()) {
            for (RoadmapTask task : phase.getTasks()) {
                totalTasks++;
                if (task.getTaskId().equalsIgnoreCase(taskId)) {
                    task.setCompleted(!task.isCompleted());
                    if (task.isCompleted()) {
                        if (!completedList.contains(taskId)) completedList.add(taskId);
                    } else {
                        completedList.remove(taskId);
                    }
                }
                if (task.isCompleted()) {
                    completedCount++;
                }
            }
        }

        roadmap.setCompletedTasks(completedList);
        int progress = totalTasks == 0 ? 0 : (int) Math.round(((double) completedCount / totalTasks) * 100);
        roadmap.setProgressPercentage(progress);
        roadmap.setUpdatedAt(LocalDateTime.now());

        return roadmapRepository.save(roadmap);
    }

    public Roadmap resetRoadmap(String userEmail, String roadmapId) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap not found"));

        for (RoadmapPhase phase : roadmap.getPhases()) {
            for (RoadmapTask task : phase.getTasks()) {
                task.setCompleted(false);
            }
        }

        roadmap.setCompletedTasks(new ArrayList<>());
        roadmap.setProgressPercentage(0);
        roadmap.setUpdatedAt(LocalDateTime.now());

        return roadmapRepository.save(roadmap);
    }

    private List<RoadmapPhase> generatePhasesForCareer(Career career) {
        List<RoadmapPhase> phases = new ArrayList<>();
        List<String> reqSkills = career.getRequiredSkills() != null ? career.getRequiredSkills() : Collections.emptyList();

        String skill1 = reqSkills.size() > 0 ? reqSkills.get(0) : "Fundamentals";
        String skill2 = reqSkills.size() > 1 ? reqSkills.get(1) : "Core Concepts";
        String skill3 = reqSkills.size() > 2 ? reqSkills.get(2) : "Frameworks";
        String skill4 = reqSkills.size() > 3 ? reqSkills.get(3) : "Architecture";
        String skill5 = reqSkills.size() > 4 ? reqSkills.get(4) : "DevOps & Cloud";

        // Phase 1
        phases.add(new RoadmapPhase(
                "p1",
                "Phase 1: Foundations & Core Logic",
                "Master syntax, algorithms, and fundamental logic.",
                "4 Weeks",
                Arrays.asList(skill1, "Problem Solving", "Git"),
                Arrays.asList(
                        new RoadmapTask("t1", "Understand syntax, variables, and control flows in " + skill1, false),
                        new RoadmapTask("t2", "Build 5 algorithmic problems on LeetCode/HackerRank", false),
                        new RoadmapTask("t3", "Version control initialization and GitHub repository setup", false)
                ),
                Arrays.asList("Official Documentation", "freeCodeCamp Interactive Tutorials")
        ));

        // Phase 2
        phases.add(new RoadmapPhase(
                "p2",
                "Phase 2: Database & Data Management",
                "Design structured and unstructured schemas, index queries, and optimize storage.",
                "3 Weeks",
                Arrays.asList(skill2, "SQL", "MongoDB"),
                Arrays.asList(
                        new RoadmapTask("t4", "Relational normalization & complex JOIN queries in SQL", false),
                        new RoadmapTask("t5", "Document modeling and aggregation pipelines in MongoDB", false),
                        new RoadmapTask("t6", "Implement CRUD repository layers", false)
                ),
                Arrays.asList("MongoDB University", "PostgreSQL Tutorial Handbook")
        ));

        // Phase 3
        phases.add(new RoadmapPhase(
                "p3",
                "Phase 3: Frameworks & Web APIs",
                "Build scalable backend services, RESTful endpoints, and security layers.",
                "5 Weeks",
                Arrays.asList(skill3, "REST APIs", "Spring Security / JWT"),
                Arrays.asList(
                        new RoadmapTask("t7", "Construct robust RESTful API endpoints with validation", false),
                        new RoadmapTask("t8", "Implement JWT token authentication & role authorization", false),
                        new RoadmapTask("t9", "Handle exceptions globally and write unit tests", false)
                ),
                Arrays.asList("Spring Boot Guides", "REST API Design Best Practices")
        ));

        // Phase 4
        phases.add(new RoadmapPhase(
                "p4",
                "Phase 4: Advanced Architecture & Full-Stack Integration",
                "Connect frontend interfaces, handle state, and design modular systems.",
                "4 Weeks",
                Arrays.asList(skill4, "State Management", "System Design"),
                Arrays.asList(
                        new RoadmapTask("t10", "Connect dynamic React components to backend APIs", false),
                        new RoadmapTask("t11", "Implement caching, asynchronous events, and rate limiting", false),
                        new RoadmapTask("t12", "Deploy end-to-end full stack application to Cloud", false)
                ),
                Arrays.asList("Full Stack Open Course", "System Design Primer")
        ));

        // Phase 5
        phases.add(new RoadmapPhase(
                "p5",
                "Phase 5: Cloud, CI/CD & Production Readiness",
                "Containerize services, set up automated pipelines, and monitor telemetry.",
                "3 Weeks",
                Arrays.asList(skill5, "Docker", "CI/CD"),
                Arrays.asList(
                        new RoadmapTask("t13", "Containerize application using Docker multi-stage builds", false),
                        new RoadmapTask("t14", "Configure GitHub Actions automated testing and deployment", false),
                        new RoadmapTask("t15", "Prepare portfolio and technical interview readiness", false)
                ),
                Arrays.asList("Docker Official Docs", "Cloud Architecture Whitepapers")
        ));

        return phases;
    }
}
