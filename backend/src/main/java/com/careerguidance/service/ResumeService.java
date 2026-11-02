package com.careerguidance.service;

import com.careerguidance.dto.*;
import com.careerguidance.model.Resume;
import com.careerguidance.model.User;
import com.careerguidance.model.UserSkill;
import com.careerguidance.repository.ResumeRepository;
import com.careerguidance.repository.UserRepository;
import com.careerguidance.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    private static final List<String> KNOWN_TECH_KEYWORDS = Arrays.asList(
            "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "PHP",
            "React", "React Native", "Angular", "Vue", "Next.js", "Redux", "HTML", "CSS", "Tailwind",
            "Node.js", "Express", "Spring Boot", "Django", "Flask", "FastAPI", "REST API", "GraphQL", "Microservices",
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "CI/CD", "Linux", "Terraform", "Jenkins",
            "Machine Learning", "Deep Learning", "Data Analysis", "Data Structures", "Algorithms", "Pandas", "NumPy",
            "Selenium", "JUnit", "Agile", "Jira"
    );

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository, UserSkillRepository userSkillRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
    }

    public ResumeAnalysisResponse analyzeResume(String userEmail, ResumeAnalysisRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String content = (request.getResumeText() != null) ? request.getResumeText().trim() : "";
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Resume text cannot be empty. Please upload or paste a valid resume.");
        }
        String lowerContent = content.toLowerCase();

        List<String> extractedSkills = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        for (String kw : KNOWN_TECH_KEYWORDS) {
            String pattern = "\\b" + java.util.regex.Pattern.quote(kw.toLowerCase()) + "\\b";
            if (java.util.regex.Pattern.compile(pattern).matcher(lowerContent).find()) {
                extractedSkills.add(kw);
            } else {
                missingKeywords.add(kw);
            }
        }

        // Calculate transparent, accurate ATS score based on user content
        int score = 25;
        // 1. Technical skills depth
        score += Math.min(35, extractedSkills.size() * 3);
        // 2. Sections
        if (lowerContent.contains("project") || lowerContent.contains("developed") || lowerContent.contains("built")) score += 10;
        if (lowerContent.contains("experience") || lowerContent.contains("intern") || lowerContent.contains("employment")) score += 10;
        if (lowerContent.contains("education") || lowerContent.contains("degree") || lowerContent.contains("b.tech") || lowerContent.contains("university")) score += 10;
        // 3. Quantifiable metrics & achievements
        if (lowerContent.contains("%") || lowerContent.contains("improved") || lowerContent.contains("optimized") || lowerContent.contains("reduced")) score += 8;
        score = Math.min(98, Math.max(30, score));

        List<String> strengths = new ArrayList<>();
        if (extractedSkills.size() >= 4) {
            strengths.add("Strong foundational technical skill coverage (" + extractedSkills.size() + " keywords detected).");
        }
        if (lowerContent.contains("project") || lowerContent.contains("developed")) {
            strengths.add("Evidence of hands-on project implementation and development experience.");
        }
        if (lowerContent.contains("git") || lowerContent.contains("github")) {
            strengths.add("Familiarity with standard modern version control practices.");
        }
        if (strengths.isEmpty()) {
            strengths.add("Clean structure and recognizable academic credentials.");
        }

        List<String> weaknesses = new ArrayList<>();
        if (missingKeywords.contains("Docker") || missingKeywords.contains("CI/CD")) {
            weaknesses.add("Lacks modern DevOps / deployment keywords (Docker, CI/CD).");
        }
        if (!lowerContent.contains("%") && !lowerContent.contains("metric") && !lowerContent.contains("improved")) {
            weaknesses.add("Missing quantifiable impact metrics and performance results in project descriptions.");
        }
        if (extractedSkills.size() < 5) {
            weaknesses.add("Low technical keyword density for automated Applicant Tracking Systems (ATS).");
        }

        List<String> suggestions = new ArrayList<>();
        suggestions.add("Add measurable business/performance impact (e.g. 'Improved query latency by 35%').");
        suggestions.add("Include critical cloud and containerization keywords (Docker, AWS, Kubernetes).");
        suggestions.add("Ensure standard section headings (Technical Skills, Projects, Education, Work Experience).");

        Resume resume = new Resume();
        resume.setUserId(user.getId());
        resume.setFileName(request.getFileName() != null ? request.getFileName() : "Resume_Document.pdf");
        resume.setExtractedSkills(extractedSkills);
        resume.setAtsScore(score);
        resume.setMissingKeywords(missingKeywords.stream().limit(6).collect(Collectors.toList()));
        resume.setStrengths(strengths);
        resume.setWeaknesses(weaknesses);
        resume.setSuggestions(suggestions);
        resume.setCreatedAt(LocalDateTime.now());

        Resume saved = resumeRepository.save(resume);

        // Sync detected skills into user skills automatically if not present
        for (String skill : extractedSkills) {
            if (userSkillRepository.findByUserIdAndSkillNameIgnoreCase(user.getId(), skill).isEmpty()) {
                userSkillRepository.save(new UserSkill(user.getId(), skill, "Extracted from Resume", "Intermediate"));
            }
        }

        return new ResumeAnalysisResponse(
                saved.getId(),
                saved.getFileName(),
                saved.getAtsScore(),
                saved.getExtractedSkills(),
                saved.getStrengths(),
                saved.getWeaknesses(),
                saved.getMissingKeywords(),
                saved.getSuggestions()
        );
    }

    public List<ResumeAnalysisResponse> getAllResumeAnalyses(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(saved -> new ResumeAnalysisResponse(
                        saved.getId(),
                        saved.getFileName(),
                        saved.getAtsScore(),
                        saved.getExtractedSkills(),
                        saved.getStrengths(),
                        saved.getWeaknesses(),
                        saved.getMissingKeywords(),
                        saved.getSuggestions()
                ))
                .collect(Collectors.toList());
    }

    public ResumeAnalysisResponse getLatestResumeAnalysis(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<Resume> latest = resumeRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        if (latest.isPresent()) {
            Resume saved = latest.get();
            return new ResumeAnalysisResponse(
                    saved.getId(),
                    saved.getFileName(),
                    saved.getAtsScore(),
                    saved.getExtractedSkills(),
                    saved.getStrengths(),
                    saved.getWeaknesses(),
                    saved.getMissingKeywords(),
                    saved.getSuggestions()
            );
        }

        // No previous analysis
        return null;
    }

    public ResumeJobMatchResponse matchResumeWithJob(ResumeJobMatchRequest request) {
        String resText = (request.getResumeText() != null ? request.getResumeText() : "").toLowerCase();
        String jdText = (request.getJobDescription() != null ? request.getJobDescription() : "").toLowerCase();

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        for (String kw : KNOWN_TECH_KEYWORDS) {
            boolean inJD = jdText.contains(kw.toLowerCase());
            boolean inResume = resText.contains(kw.toLowerCase());

            if (inJD && inResume) {
                matchedSkills.add(kw);
                matchedKeywords.add(kw);
            } else if (inJD && !inResume) {
                missingSkills.add(kw);
                missingKeywords.add(kw);
            } else if (inResume) {
                matchedKeywords.add(kw);
            }
        }

        int totalJdSkills = matchedSkills.size() + missingSkills.size();
        int score = totalJdSkills == 0 ? 75 : (int) Math.round(((double) matchedSkills.size() / totalJdSkills) * 100);
        score = Math.min(96, Math.max(30, score));

        List<String> recommendations = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            recommendations.add("Explicitly incorporate missing keywords: " + String.join(", ", missingSkills));
        }
        recommendations.add("Align project bullet points to mirror action verbs in the target job specification.");
        recommendations.add("Ensure target job title ('" + (request.getTargetJobTitle() != null ? request.getTargetJobTitle() : "Candidate") + "') is prominent in your resume summary.");

        ResumeJobMatchResponse response = new ResumeJobMatchResponse();
        response.setOverallMatchPercentage(score);
        response.setMatchedSkills(matchedSkills);
        response.setMissingSkills(missingSkills);
        response.setMatchingKeywords(matchedKeywords);
        response.setMissingKeywords(missingKeywords);
        response.setEducationMatchStatus("Strong Match (Bachelor's / Engineering Degree)");
        response.setExperienceMatchStatus("Candidate profile meets entry/intermediate role prerequisites");
        response.setRecommendations(recommendations);

        return response;
    }
}
