package com.careerguidance.service;

import com.careerguidance.dto.*;
import com.careerguidance.model.*;
import com.careerguidance.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final CareerRepository careerRepository;
    private final JobRepository jobRepository;
    private final InternshipRepository internshipRepository;
    private final SavedJobRepository savedJobRepository;
    private final SavedInternshipRepository savedInternshipRepository;
    private final RoadmapRepository roadmapRepository;
    private final ResumeRepository resumeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MatchingEngineService matchingEngineService;

    public AuthService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            CareerRepository careerRepository,
            JobRepository jobRepository,
            InternshipRepository internshipRepository,
            SavedJobRepository savedJobRepository,
            SavedInternshipRepository savedInternshipRepository,
            RoadmapRepository roadmapRepository,
            ResumeRepository resumeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            MatchingEngineService matchingEngineService
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.careerRepository = careerRepository;
        this.jobRepository = jobRepository;
        this.internshipRepository = internshipRepository;
        this.savedJobRepository = savedJobRepository;
        this.savedInternshipRepository = savedInternshipRepository;
        this.roadmapRepository = roadmapRepository;
        this.resumeRepository = resumeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.matchingEngineService = matchingEngineService;
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isEmpty()) {
            // Seamless auto-provisioning: If new user logs in directly with custom email, create their profile!
            String rawPrefix = email.split("@")[0];
            String cleanName = Character.toUpperCase(rawPrefix.charAt(0)) + rawPrefix.substring(1).replaceAll("[._0-9]+", " ").trim();
            if (cleanName.isEmpty()) cleanName = "User";

            User newUser = new User();
            newUser.setFullName(cleanName);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            newUser.setRole("ROLE_USER");
            newUser.setEducation("Undergraduate");
            newUser.setCollege("University");
            newUser.setDegree("B.Tech Computer Science");
            newUser.setGraduationYear(2026);
            newUser.setCgpa(8.5);
            newUser.setInterests(Arrays.asList("Software Development", "Cloud Systems", "Web Technologies"));
            newUser.setProfileCompletion(85);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());

            user = userRepository.save(newUser);

            // Seed starter skills for the new user profile
            userSkillRepository.save(new UserSkill(user.getId(), "Java", "Programming", "Intermediate"));
            userSkillRepository.save(new UserSkill(user.getId(), "React.js", "Web Development", "Intermediate"));
            userSkillRepository.save(new UserSkill(user.getId(), "SQL", "Database", "Intermediate"));
            userSkillRepository.save(new UserSkill(user.getId(), "HTML", "Web Development", "Advanced"));
            userSkillRepository.save(new UserSkill(user.getId(), "JavaScript", "Programming", "Intermediate"));
        } else {
            user = userOptional.get();
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Incorrect password for " + email + ". Please check your password.");
            }
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getFullName(), user.getId());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole(), "Welcome, " + user.getFullName() + "!");
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setEducation(request.getEducation() != null ? request.getEducation() : "Undergraduate");
        user.setCollege(request.getCollege() != null ? request.getCollege() : "Engineering University");
        user.setDegree(request.getDegree() != null ? request.getDegree() : "B.Tech Computer Science");
        user.setGraduationYear(request.getGraduationYear() != null ? request.getGraduationYear() : 2026);
        user.setCgpa(8.4);
        user.setInterests(Arrays.asList("Software Development", "Cloud Systems", "Web Technologies"));
        user.setRole("ROLE_USER");
        user.setProfileCompletion(80);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Seed initial standard starter skills for new user
        userSkillRepository.save(new UserSkill(savedUser.getId(), "Java", "Programming", "Intermediate"));
        userSkillRepository.save(new UserSkill(savedUser.getId(), "SQL", "Database", "Intermediate"));
        userSkillRepository.save(new UserSkill(savedUser.getId(), "HTML", "Web Development", "Advanced"));
        userSkillRepository.save(new UserSkill(savedUser.getId(), "CSS", "Web Development", "Intermediate"));
        userSkillRepository.save(new UserSkill(savedUser.getId(), "JavaScript", "Programming", "Intermediate"));

        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getFullName(), savedUser.getId());
        return new AuthResponse(token, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole(), "Registration successful");
    }

    public MessageResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return new MessageResponse(true, "Password changed successfully.");
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String resetToken = UUID.randomUUID().toString().replace("-", "");
            user.setResetPasswordToken(resetToken);
            user.setResetPasswordExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            return new MessageResponse(true, "Password reset link generated successfully.", resetToken);
        }

        return new MessageResponse(true, "If the email is registered, password reset instructions have been sent.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByResetPasswordToken(request.getToken());

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired password reset token.");
        }

        User user = userOptional.get();
        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return new MessageResponse(true, "Password reset successfully. You can now login.");
    }

    public UserProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setEducation(user.getEducation());
        dto.setCollege(user.getCollege());
        dto.setDegree(user.getDegree());
        dto.setBranch(user.getBranch());
        dto.setGraduationYear(user.getGraduationYear());
        dto.setCgpa(user.getCgpa());
        dto.setInterests(user.getInterests());
        dto.setCertifications(user.getCertifications());
        dto.setPreferredDomain(user.getPreferredDomain());
        dto.setPreferredRole(user.getPreferredRole());
        dto.setPreferredLocation(user.getPreferredLocation());
        dto.setPreferredWorkMode(user.getPreferredWorkMode());
        dto.setExperienceLevel(user.getExperienceLevel());
        dto.setCareerGoals(user.getCareerGoals());
        dto.setProfileCompletion(user.getProfileCompletion());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    public UserProfileDto updateProfile(String email, UserProfileDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getEducation() != null) user.setEducation(dto.getEducation());
        if (dto.getCollege() != null) user.setCollege(dto.getCollege());
        if (dto.getDegree() != null) user.setDegree(dto.getDegree());
        if (dto.getBranch() != null) user.setBranch(dto.getBranch());
        if (dto.getGraduationYear() != null) user.setGraduationYear(dto.getGraduationYear());
        if (dto.getCgpa() != null) user.setCgpa(dto.getCgpa());
        if (dto.getInterests() != null) user.setInterests(dto.getInterests());
        if (dto.getCertifications() != null) user.setCertifications(dto.getCertifications());
        if (dto.getPreferredDomain() != null) user.setPreferredDomain(dto.getPreferredDomain());
        if (dto.getPreferredRole() != null) user.setPreferredRole(dto.getPreferredRole());
        if (dto.getPreferredLocation() != null) user.setPreferredLocation(dto.getPreferredLocation());
        if (dto.getPreferredWorkMode() != null) user.setPreferredWorkMode(dto.getPreferredWorkMode());
        if (dto.getExperienceLevel() != null) user.setExperienceLevel(dto.getExperienceLevel());
        if (dto.getCareerGoals() != null) user.setCareerGoals(dto.getCareerGoals());

        // Calculate dynamic profile completion %
        int score = 40;
        if (user.getCollege() != null && !user.getCollege().isEmpty()) score += 15;
        if (user.getDegree() != null && !user.getDegree().isEmpty()) score += 15;
        if (user.getInterests() != null && !user.getInterests().isEmpty()) score += 15;
        if (user.getPreferredRole() != null && !user.getPreferredRole().isEmpty()) score += 15;
        user.setProfileCompletion(Math.min(100, score));

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return getProfile(email);
    }

    public DashboardSummaryDto getDashboardSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<UserSkill> userSkills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = userSkills.stream().map(UserSkill::getSkillName).collect(Collectors.toList());

        List<Career> allCareers = careerRepository.findAll();
        List<CareerMatchDto> matchedCareers = allCareers.stream()
                .map(career -> matchingEngineService.matchCareer(user, career, skillNames))
                .sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()))
                .collect(Collectors.toList());

        CareerMatchDto topCareer = matchedCareers.isEmpty() ? null : matchedCareers.get(0);

        // Saved opportunities count
        int savedJobsCount = savedJobRepository.findByUserId(user.getId()).size();
        int savedInternshipsCount = savedInternshipRepository.findByUserId(user.getId()).size();

        // Roadmap progress
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(user.getId());
        int roadmapProgress = roadmaps.isEmpty() ? 0 :
                roadmaps.stream().mapToInt(Roadmap::getProgressPercentage).max().orElse(0);

        // ATS score
        Optional<Resume> latestResume = resumeRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        int atsScore = latestResume.map(Resume::getAtsScore).orElse(75);

        // Top recommended jobs & internships
        Set<String> savedJobIds = savedJobRepository.findByUserId(user.getId()).stream()
                .map(SavedJob::getJobId).collect(Collectors.toSet());
        List<JobDto> topJobs = jobRepository.findAll().stream()
                .map(j -> matchingEngineService.matchJob(user, j, skillNames, savedJobIds.contains(j.getId())))
                .sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()))
                .limit(4)
                .collect(Collectors.toList());

        Set<String> savedInternshipIds = savedInternshipRepository.findByUserId(user.getId()).stream()
                .map(SavedInternship::getInternshipId).collect(Collectors.toSet());
        List<InternshipDto> topInternships = internshipRepository.findAll().stream()
                .map(i -> matchingEngineService.matchInternship(user, i, skillNames, savedInternshipIds.contains(i.getId())))
                .sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()))
                .limit(4)
                .collect(Collectors.toList());

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setUserName(user.getFullName() != null ? user.getFullName() : "Career Explorer");
        summary.setUserEmail(user.getEmail());
        summary.setProfileCompletion(user.getProfileCompletion() != null ? user.getProfileCompletion() : 0);
        summary.setTotalSkillsCount(userSkills != null ? userSkills.size() : 0);
        summary.setActiveSkillGapsCount(topCareer != null && topCareer.getMissingSkills() != null ? topCareer.getMissingSkills().size() : 0);
        summary.setRoadmapProgressPercentage(roadmapProgress);
        summary.setLatestAtsScore(atsScore);
        summary.setSavedOpportunitiesCount(savedJobsCount + savedInternshipsCount);
        summary.setRecommendedCareer(topCareer);
        summary.setTopCareers(matchedCareers != null ? matchedCareers.stream().limit(5).collect(Collectors.toList()) : Collections.emptyList());
        summary.setRecentSkills(userSkills != null ? userSkills : Collections.emptyList());
        summary.setRecommendedJobs(topJobs != null ? topJobs : Collections.emptyList());
        summary.setRecommendedInternships(topInternships != null ? topInternships : Collections.emptyList());

        return summary;
    }
}
