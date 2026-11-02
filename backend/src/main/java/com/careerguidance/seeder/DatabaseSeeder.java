package com.careerguidance.seeder;

import com.careerguidance.model.*;
import com.careerguidance.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final CareerRepository careerRepository;
    private final SkillRepository skillRepository;
    private final JobRepository jobRepository;
    private final InternshipRepository internshipRepository;
    private final LearningResourceRepository learningResourceRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            CareerRepository careerRepository,
            SkillRepository skillRepository,
            JobRepository jobRepository,
            InternshipRepository internshipRepository,
            LearningResourceRepository learningResourceRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.careerRepository = careerRepository;
        this.skillRepository = skillRepository;
        this.jobRepository = jobRepository;
        this.internshipRepository = internshipRepository;
        this.learningResourceRepository = learningResourceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            seedSkills();
            seedCareers();
            seedJobs();
            seedInternships();
            seedLearningResources();
            seedDemoUser();
            logger.info(">>> Smart Career Guidance Database Seeded Successfully!");
        } catch (Exception e) {
            logger.warn("DatabaseSeeder: Note during seeding: {}", e.getMessage());
        }
    }

    private void seedDemoUser() {
        String testEmail = "demo@example.com";
        User demoUser;
        if (!userRepository.existsByEmail(testEmail)) {
            demoUser = new User();
            demoUser.setFullName("Alex Rivera");
            demoUser.setEmail(testEmail);
            demoUser.setPassword(passwordEncoder.encode("Demo@123"));
            demoUser.setPhone("+91 9876543210");
            demoUser.setEducation("Undergraduate (Final Year)");
            demoUser.setCollege("National Institute of Technology");
            demoUser.setDegree("B.Tech in Computer Science and Engineering");
            demoUser.setBranch("Computer Science");
            demoUser.setGraduationYear(2026);
            demoUser.setCgpa(8.85);
            demoUser.setRole("ROLE_USER");
            demoUser.setPreferredDomain("Software Engineering");
            demoUser.setPreferredRole("Full Stack Java Developer");
            demoUser.setPreferredLocation("Bengaluru / Hybrid");
            demoUser.setPreferredWorkMode("Hybrid");
            demoUser.setExperienceLevel("Fresher / Entry Level");
            demoUser.setCareerGoals("Aspiring to architect scalable enterprise cloud-native applications and lead engineering teams.");
            demoUser.setInterests(Arrays.asList("Full Stack Web", "Distributed Systems", "Cloud Computing", "AI Integration"));
            demoUser.setCertifications(Arrays.asList(
                    new User.Certification("Oracle Certified Java Associate", "Oracle", 2024, "https://oracle.com/cert/123"),
                    new User.Certification("AWS Certified Cloud Practitioner", "Amazon Web Services", 2025, "https://aws.amazon.com/cert/456")
            ));
            demoUser.setProfileCompletion(92);
            demoUser.setCreatedAt(LocalDateTime.now());
            demoUser.setUpdatedAt(LocalDateTime.now());

            demoUser = userRepository.save(demoUser);

            // Seed user skills
            userSkillRepository.save(new UserSkill(demoUser.getId(), "Java", "Programming", "Advanced"));
            userSkillRepository.save(new UserSkill(demoUser.getId(), "Spring Boot", "Web Development", "Intermediate"));
            userSkillRepository.save(new UserSkill(demoUser.getId(), "SQL", "Database", "Intermediate"));
            userSkillRepository.save(new UserSkill(demoUser.getId(), "React", "Web Development", "Intermediate"));
            userSkillRepository.save(new UserSkill(demoUser.getId(), "JavaScript", "Programming", "Advanced"));
            userSkillRepository.save(new UserSkill(demoUser.getId(), "HTML", "Web Development", "Advanced"));
            userSkillRepository.save(new UserSkill(demoUser.getId(), "CSS", "Web Development", "Advanced"));
            userSkillRepository.save(new UserSkill(demoUser.getId(), "Git", "DevOps", "Intermediate"));

            logger.info(">>> Demo User seeded: demo@example.com / Demo@123");
        }
    }

    private void seedSkills() {
        if (skillRepository.count() > 0) return;

        List<Skill> skills = Arrays.asList(
                new Skill("sk_1", "Java", "Programming", "Core OOP, Collections, Concurrency, JVM internals"),
                new Skill("sk_2", "Python", "Programming", "Data processing, backend scripting, machine learning"),
                new Skill("sk_3", "JavaScript", "Programming", "Modern ES6+, asynchronous programming, DOM"),
                new Skill("sk_4", "TypeScript", "Programming", "Strict typing, interfaces, generics for scalable frontend/backend"),
                new Skill("sk_5", "C++", "Programming", "Low-level system programming, memory management, STL"),
                new Skill("sk_6", "React", "Web Development", "Hooks, component architecture, state management"),
                new Skill("sk_7", "Spring Boot", "Web Development", "Enterprise REST APIs, dependency injection, microservices"),
                new Skill("sk_8", "Node.js", "Web Development", "Event-driven runtime for scalable network applications"),
                new Skill("sk_9", "HTML", "Web Development", "Semantic markup, accessibility, SEO"),
                new Skill("sk_10", "CSS", "Web Development", "Responsive layouts, Flexbox, CSS Grid, animations"),
                new Skill("sk_11", "SQL", "Database", "Relational database querying, normalization, indexing, joins"),
                new Skill("sk_12", "MongoDB", "Database", "NoSQL document store, aggregation pipelines, schema design"),
                new Skill("sk_13", "PostgreSQL", "Database", "Advanced open-source relational database with JSON support"),
                new Skill("sk_14", "Docker", "DevOps", "Containerization, Dockerfile optimization, multi-stage builds"),
                new Skill("sk_15", "Kubernetes", "DevOps", "Container orchestration, deployments, service discovery"),
                new Skill("sk_16", "Git", "DevOps", "Version control, branching strategies, merge conflict resolution"),
                new Skill("sk_17", "CI/CD", "DevOps", "Automated pipelines with GitHub Actions and Jenkins"),
                new Skill("sk_18", "AWS", "Cloud", "EC2, S3, RDS, Lambda, VPC cloud architecture"),
                new Skill("sk_19", "Azure", "Cloud", "Microsoft cloud compute, App Services, Blob storage"),
                new Skill("sk_20", "Data Structures", "Programming", "Trees, Graphs, HashTables, Heaps, dynamic programming"),
                new Skill("sk_21", "REST API", "Web Development", "Stateless HTTP protocol, JSON serialization, status codes"),
                new Skill("sk_22", "GraphQL", "Web Development", "Declarative data fetching and schema-based APIs"),
                new Skill("sk_23", "Machine Learning", "AI/ML", "Supervised/unsupervised models, scikit-learn, evaluation metrics"),
                new Skill("sk_24", "Deep Learning", "AI/ML", "Neural networks, PyTorch, TensorFlow, CNNs/Transformers"),
                new Skill("sk_25", "Selenium", "Other", "Automated browser testing and test framework integration"),
                new Skill("sk_26", "Communication", "Soft Skills", "Technical writing, cross-team collaboration, presentations")
        );

        skillRepository.saveAll(skills);
    }

    private void seedCareers() {
        if (careerRepository.count() > 0) return;

        List<Career> careers = Arrays.asList(
                new Career(
                        "c_1",
                        "Full Stack Java Developer",
                        "Design and implement end-to-end enterprise web applications utilizing Spring Boot microservices on the backend and React on the client tier.",
                        "Software Engineering",
                        Arrays.asList("Java", "Spring Boot", "SQL", "React", "REST API", "Git"),
                        Arrays.asList("Docker", "MongoDB", "AWS", "CI/CD"),
                        "₹8.5 LPA - ₹18.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Develop robust RESTful APIs", "Build responsive interactive user interfaces", "Maintain database schemas and ORM mapping"),
                        Arrays.asList("Junior Developer", "Full Stack Engineer", "Senior Architect", "Engineering Director"),
                        "Code"
                ),
                new Career(
                        "c_2",
                        "Frontend React Specialist",
                        "Craft high-performance, accessible, and responsive user experiences using React, modern JavaScript, and CSS architecture.",
                        "Frontend Engineering",
                        Arrays.asList("React", "JavaScript", "HTML", "CSS", "TypeScript", "Git"),
                        Arrays.asList("GraphQL", "Next.js", "TailwindCSS", "Jest"),
                        "₹7.0 LPA - ₹16.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Translate UI/UX mockups into pixel-perfect components", "Optimize Web Vitals & bundle size", "Integrate backend GraphQL & REST endpoints"),
                        Arrays.asList("Junior Frontend Dev", "Senior UI Engineer", "Frontend Lead", "Head of UX"),
                        "Layout"
                ),
                new Career(
                        "c_3",
                        "Backend Services Engineer",
                        "Build fault-tolerant, high-throughput microservices, transaction management systems, and data pipelines.",
                        "Backend Engineering",
                        Arrays.asList("Java", "Spring Boot", "SQL", "REST API", "PostgreSQL", "Git"),
                        Arrays.asList("Docker", "Kubernetes", "Redis", "Kafka"),
                        "₹8.0 LPA - ₹17.5 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Implement business logic and data persistence", "Ensure API security and authentication", "Tune query execution plans"),
                        Arrays.asList("Backend Developer", "Staff Backend Engineer", "Principal Architect"),
                        "Server"
                ),
                new Career(
                        "c_4",
                        "Cloud & DevOps Engineer",
                        "Automate continuous integration/continuous delivery pipelines, infrastructure as code, and cloud cluster monitoring.",
                        "Cloud & Infrastructure",
                        Arrays.asList("Docker", "Kubernetes", "AWS", "Git", "CI/CD", "Linux"),
                        Arrays.asList("Terraform", "Python", "Prometheus", "Ansible"),
                        "₹9.0 LPA - ₹20.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Automate container builds and deployments", "Manage cloud infrastructure resources", "Implement observability and auto-scaling"),
                        Arrays.asList("DevOps Associate", "Cloud Engineer", "Lead SRE", "Cloud Architect"),
                        "Cloud"
                ),
                new Career(
                        "c_5",
                        "Data Analyst & BI Specialist",
                        "Transform raw business data into actionable visual dashboards, statistical reports, and predictive trend models.",
                        "Data & Analytics",
                        Arrays.asList("SQL", "Python", "Data Structures", "PostgreSQL"),
                        Arrays.asList("Tableau", "PowerBI", "Machine Learning", "Pandas"),
                        "₹6.5 LPA - ₹14.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Extract and clean datasets from relational databases", "Build interactive reporting dashboards", "Collaborate with product leaders on KPI tracking"),
                        Arrays.asList("Data Analyst", "Senior Analyst", "Analytics Manager", "VP of Business Intelligence"),
                        "BarChart3"
                ),
                new Career(
                        "c_6",
                        "AI / Machine Learning Engineer",
                        "Develop, evaluate, and deploy neural networks, natural language processing pipelines, and predictive algorithms.",
                        "Artificial Intelligence",
                        Arrays.asList("Python", "Machine Learning", "Deep Learning", "Data Structures"),
                        Arrays.asList("Docker", "AWS", "SQL", "Git"),
                        "₹10.0 LPA - ₹22.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Train and fine-tune machine learning models", "Perform feature engineering on high-dimensional data", "Expose models via inference APIs"),
                        Arrays.asList("ML Engineer", "Senior AI Researcher", "Chief Data Scientist"),
                        "Brain"
                ),
                new Career(
                        "c_7",
                        "Database Administrator & Developer",
                        "Design robust relational and NoSQL schemas, guarantee 99.99% uptime, backup strategies, and query performance tuning.",
                        "Database Management",
                        Arrays.asList("SQL", "MongoDB", "PostgreSQL", "Database Design"),
                        Arrays.asList("Python", "Linux", "Docker"),
                        "₹7.5 LPA - ₹15.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Manage replication, indexing, and sharding", "Maintain data backup and recovery drills", "Optimize slow-running database queries"),
                        Arrays.asList("Junior DBA", "Senior Database Engineer", "Lead Data Infrastructure"),
                        "Database"
                ),
                new Career(
                        "c_8",
                        "QA & Test Automation Engineer",
                        "Ensure product quality and reliability through automated end-to-end testing suites, performance benchmarking, and regression pipelines.",
                        "Quality Engineering",
                        Arrays.asList("Java", "Selenium", "JavaScript", "Git", "REST API"),
                        Arrays.asList("CI/CD", "Docker", "Python"),
                        "₹6.0 LPA - ₹13.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Author automated regression tests with Selenium/Cypress", "Execute load and performance benchmarking", "Identify and report critical security regressions"),
                        Arrays.asList("QA Tester", "Automation Lead", "Quality Director"),
                        "CheckCircle"
                ),
                new Career(
                        "c_9",
                        "Mobile Application Developer",
                        "Build engaging native and hybrid mobile applications for iOS and Android with fluid animations and offline sync.",
                        "Mobile Engineering",
                        Arrays.asList("React", "JavaScript", "TypeScript", "REST API", "Git"),
                        Arrays.asList("Flutter", "Java", "Docker"),
                        "₹7.0 LPA - ₹16.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Develop cross-platform apps using React Native/Flutter", "Integrate device hardware APIs and push notifications", "Publish releases to App Store and Google Play"),
                        Arrays.asList("Junior Mobile Dev", "Senior Mobile Engineer", "Mobile Architect"),
                        "Smartphone"
                ),
                new Career(
                        "c_10",
                        "Cyber Security & DevSecOps Analyst",
                        "Guard cloud infrastructure and applications against vulnerabilities, conduct code audits, and ensure compliance standards.",
                        "Information Security",
                        Arrays.asList("Linux", "Git", "Python", "SQL", "AWS"),
                        Arrays.asList("Docker", "CI/CD", "Kubernetes"),
                        "₹8.5 LPA - ₹19.0 LPA",
                        "Fresher / Entry Level",
                        Arrays.asList("Perform penetration testing and vulnerability scans", "Implement role-based access controls and audit logs", "Educate engineering teams on OWASP top 10 security"),
                        Arrays.asList("Security Analyst", "DevSecOps Lead", "Chief Information Security Officer"),
                        "Shield"
                )
        );

        careerRepository.saveAll(careers);
    }

    private void seedJobs() {
        if (jobRepository.count() > 0) return;

        List<Job> jobs = Arrays.asList(
                new Job(
                        "job_1",
                        "Junior Java Full Stack Developer",
                        "Infosys Technologies",
                        "Bengaluru, Karnataka",
                        "Hybrid",
                        "Fresher (0-1 yr)",
                        Arrays.asList("Java", "Spring Boot", "SQL", "React", "Git"),
                        "Join our Global Digital Engineering unit to build scalable customer-facing banking applications.",
                        "https://careers.infosys.com",
                        "₹6.5 - ₹9.0 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(1).toString()
                ),
                new Job(
                        "job_2",
                        "Associate Software Engineer - React",
                        "TCS Interactive",
                        "Hyderabad, Telangana",
                        "Hybrid",
                        "Fresher (0-2 yrs)",
                        Arrays.asList("React", "JavaScript", "HTML", "CSS", "Git"),
                        "Develop modern responsive dashboards and interactive client portals for international retail clients.",
                        "https://www.tcs.com/careers",
                        "₹5.5 - ₹8.0 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(2).toString()
                ),
                new Job(
                        "job_3",
                        "Backend Platform Engineer",
                        "Microsoft Corporation",
                        "Hyderabad / Bengaluru",
                        "Hybrid",
                        "0-2 years",
                        Arrays.asList("Java", "Spring Boot", "SQL", "REST API", "Docker"),
                        "Collaborate with the Azure Services team to build mission-critical distributed backend APIs.",
                        "https://careers.microsoft.com",
                        "₹14.0 - ₹22.0 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(3).toString()
                ),
                new Job(
                        "job_4",
                        "Cloud DevOps Engineer",
                        "Amazon Web Services",
                        "Bengaluru, Karnataka",
                        "Onsite",
                        "0-1 year",
                        Arrays.asList("AWS", "Docker", "Kubernetes", "Linux", "Git"),
                        "Manage global container infrastructure and automated continuous deployment workflows.",
                        "https://amazon.jobs",
                        "₹16.0 - ₹24.0 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(2).toString()
                ),
                new Job(
                        "job_5",
                        "Data Analyst Associate",
                        "Deloitte Consulting",
                        "Pune, Maharashtra",
                        "Hybrid",
                        "Fresher",
                        Arrays.asList("SQL", "Python", "Data Structures", "PostgreSQL"),
                        "Transform business data into actionable client insights and dynamic executive dashboards.",
                        "https://deloitte.com/careers",
                        "₹7.0 - ₹10.5 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(4).toString()
                ),
                new Job(
                        "job_6",
                        "Software Development Engineer I",
                        "Uber Technologies",
                        "Bengaluru, Karnataka",
                        "Hybrid",
                        "0-2 years",
                        Arrays.asList("Java", "Data Structures", "SQL", "REST API", "Git"),
                        "Build real-time dispatch systems and geospatial routing services operating at massive scale.",
                        "https://uber.com/careers",
                        "₹18.0 - ₹28.0 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(1).toString()
                ),
                new Job(
                        "job_7",
                        "Junior Full Stack Web Developer",
                        "Wipro Digital",
                        "Chennai, Tamil Nadu",
                        "Remote",
                        "Fresher (0-1 yr)",
                        Arrays.asList("JavaScript", "React", "Node.js", "MongoDB", "HTML"),
                        "Develop cloud-native applications with modern micro-frontend architectures.",
                        "https://careers.wipro.com",
                        "₹5.0 - ₹7.5 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(5).toString()
                ),
                new Job(
                        "job_8",
                        "QA Test Automation Specialist",
                        "Cognizant",
                        "Kolkata / Remote",
                        "Remote",
                        "Fresher",
                        Arrays.asList("Java", "Selenium", "JavaScript", "Git"),
                        "Design and execute test automation frameworks for e-commerce and fintech platforms.",
                        "https://careers.cognizant.com",
                        "₹5.2 - ₹7.8 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(3).toString()
                ),
                new Job(
                        "job_9",
                        "Junior AI / ML Software Engineer",
                        "Fractal Analytics",
                        "Mumbai, Maharashtra",
                        "Hybrid",
                        "0-1 year",
                        Arrays.asList("Python", "Machine Learning", "SQL", "Data Structures"),
                        "Train computer vision and NLP models for Fortune 500 enterprise clients.",
                        "https://fractal.ai/careers",
                        "₹8.0 - ₹13.0 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(6).toString()
                ),
                new Job(
                        "job_10",
                        "Junior Database Engineer",
                        "Oracle Cloud Infrastructure",
                        "Bengaluru, Karnataka",
                        "Hybrid",
                        "0-2 years",
                        Arrays.asList("SQL", "PostgreSQL", "MongoDB", "Linux"),
                        "Optimize database storage engines, clustering, and automated failover recovery mechanisms.",
                        "https://oracle.com/careers",
                        "₹11.0 - ₹16.0 LPA",
                        "Full-Time",
                        LocalDate.now().minusDays(2).toString()
                )
        );

        jobRepository.saveAll(jobs);
    }

    private void seedInternships() {
        if (internshipRepository.count() > 0) return;

        List<Internship> internships = Arrays.asList(
                new Internship(
                        "int_1",
                        "Full Stack Developer Intern",
                        "Google India",
                        "Bengaluru / Hybrid",
                        "6 Months",
                        "₹85,000 / month",
                        Arrays.asList("Java", "JavaScript", "React", "Data Structures", "SQL"),
                        "Hybrid",
                        "Work alongside senior Google engineers building scalable web developer tools.",
                        "https://careers.google.com/students",
                        LocalDate.now().minusDays(1).toString()
                ),
                new Internship(
                        "int_2",
                        "Software Engineering Intern (Summer 2026)",
                        "Microsoft",
                        "Hyderabad, Telangana",
                        "3 Months",
                        "₹80,000 / month",
                        Arrays.asList("Java", "Spring Boot", "SQL", "Git", "REST API"),
                        "Hybrid",
                        "Gain hands-on experience building distributed cloud services for global customers.",
                        "https://careers.microsoft.com/students",
                        LocalDate.now().minusDays(2).toString()
                ),
                new Internship(
                        "int_3",
                        "Frontend React Engineering Intern",
                        "Swiggy",
                        "Bengaluru, Karnataka",
                        "6 Months",
                        "₹45,000 / month",
                        Arrays.asList("React", "JavaScript", "HTML", "CSS"),
                        "Remote",
                        "Build dynamic components for restaurant partners and delivery tracking dashboards.",
                        "https://swiggy.com/careers",
                        LocalDate.now().minusDays(3).toString()
                ),
                new Internship(
                        "int_4",
                        "Cloud & DevOps Intern",
                        "Razorpay",
                        "Bengaluru, Karnataka",
                        "6 Months",
                        "₹40,000 / month",
                        Arrays.asList("Docker", "AWS", "Linux", "Git"),
                        "Hybrid",
                        "Assist the reliability engineering team in managing containerized payment clusters.",
                        "https://razorpay.com/jobs",
                        LocalDate.now().minusDays(4).toString()
                ),
                new Internship(
                        "int_5",
                        "Data Analytics & SQL Intern",
                        "Flipkart",
                        "Bengaluru, Karnataka",
                        "3 Months",
                        "₹35,000 / month",
                        Arrays.asList("SQL", "Python", "PostgreSQL", "Data Structures"),
                        "Hybrid",
                        "Analyze consumer shopping patterns and optimize supply chain delivery metrics.",
                        "https://flipkartcareers.com",
                        LocalDate.now().minusDays(2).toString()
                ),
                new Internship(
                        "int_6",
                        "Java Backend Development Intern",
                        "Zoho Corporation",
                        "Chennai, Tamil Nadu",
                        "6 Months",
                        "₹30,000 / month",
                        Arrays.asList("Java", "SQL", "REST API", "Git"),
                        "Onsite",
                        "Build scalable business software modules and high-performance relational storage layers.",
                        "https://zoho.com/careers",
                        LocalDate.now().minusDays(5).toString()
                ),
                new Internship(
                        "int_7",
                        "AI & Machine Learning Research Intern",
                        "Samsung R&D Institute",
                        "Bengaluru, Karnataka",
                        "6 Months",
                        "₹50,000 / month",
                        Arrays.asList("Python", "Machine Learning", "Deep Learning"),
                        "Hybrid",
                        "Research on-device computer vision models for next-generation consumer electronics.",
                        "https://research.samsung.com",
                        LocalDate.now().minusDays(3).toString()
                ),
                new Internship(
                        "int_8",
                        "Web Development & UI Intern",
                        "Zomato",
                        "Gurugram / Remote",
                        "3 Months",
                        "₹35,000 / month",
                        Arrays.asList("HTML", "CSS", "JavaScript", "React"),
                        "Remote",
                        "Develop delightful web experiences and interactive ordering interfaces.",
                        "https://zomato.com/careers",
                        LocalDate.now().minusDays(1).toString()
                ),
                new Internship(
                        "int_9",
                        "QA Automation Engineering Intern",
                        "Paytm",
                        "Noida, UP",
                        "6 Months",
                        "₹28,000 / month",
                        Arrays.asList("Java", "Selenium", "Git"),
                        "Hybrid",
                        "Automate mobile and web payment verification testing suites.",
                        "https://paytm.com/careers",
                        LocalDate.now().minusDays(4).toString()
                ),
                new Internship(
                        "int_10",
                        "Mobile App Development Intern (React Native)",
                        "Cred",
                        "Bengaluru, Karnataka",
                        "6 Months",
                        "₹55,000 / month",
                        Arrays.asList("React", "JavaScript", "TypeScript", "Git"),
                        "Hybrid",
                        "Help engineer hyper-smooth user interfaces and reward animations.",
                        "https://cred.club/careers",
                        LocalDate.now().minusDays(2).toString()
                )
        );

        internshipRepository.saveAll(internships);
    }

    private void seedLearningResources() {
        if (learningResourceRepository.count() > 0) return;

        List<LearningResource> resources = Arrays.asList(
                new LearningResource("res_1", "Java Programming Masterclass", "Coursera", "https://coursera.org/learn/java-programming", "Java", "Beginner", "30 Hours", "Course"),
                new LearningResource("res_2", "Spring Boot 3 & Microservices Deep Dive", "Udemy", "https://udemy.com/course/spring-boot-and-spring-framework", "Spring Boot", "Intermediate", "24 Hours", "Course"),
                new LearningResource("res_3", "Full React 18 & Redux Toolkit Course", "freeCodeCamp", "https://freecodecamp.org/news/learn-react-full-course", "React", "Intermediate", "12 Hours", "Video"),
                new LearningResource("res_4", "Complete SQL Mastery & Query Optimization", "YouTube", "https://youtube.com/watch?v=HXV3zeRR3h4", "SQL", "Beginner", "6 Hours", "Video"),
                new LearningResource("res_5", "Docker for Java & Full Stack Developers", "Docker Official", "https://docs.docker.com/get-started", "Docker", "Intermediate", "8 Hours", "Documentation"),
                new LearningResource("res_6", "AWS Certified Cloud Practitioner Training", "freeCodeCamp", "https://youtube.com/watch?v=SOTamWNgDKc", "AWS", "Beginner", "14 Hours", "Video"),
                new LearningResource("res_7", "Data Structures & Algorithms in Java", "LeetCode", "https://leetcode.com/explore", "Data Structures", "Intermediate", "40 Hours", "Practice"),
                new LearningResource("res_8", "Modern JavaScript (ES6+) Complete Guide", "freeCodeCamp", "https://javascript.info", "JavaScript", "Beginner", "15 Hours", "Tutorial"),
                new LearningResource("res_9", "MongoDB Data Modeling and Aggregation", "MongoDB University", "https://learn.mongodb.com", "MongoDB", "Intermediate", "10 Hours", "Course"),
                new LearningResource("res_10", "RESTful API Design Best Practices", "Microsoft Learn", "https://learn.microsoft.com/azure/architecture/best-practices/api-design", "REST API", "Intermediate", "5 Hours", "Documentation"),
                new LearningResource("res_11", "Git & GitHub Crash Course for Developers", "YouTube", "https://youtube.com/watch?v=RGOj5yH7evk", "Git", "Beginner", "2 Hours", "Video"),
                new LearningResource("res_12", "Machine Learning Specialization by Andrew Ng", "Coursera", "https://coursera.org/specializations/machine-learning-introduction", "Machine Learning", "Intermediate", "45 Hours", "Course")
        );

        learningResourceRepository.saveAll(resources);
    }
}
