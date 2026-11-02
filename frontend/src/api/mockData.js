// Centralized, Fully-Synchronized Mock & In-Memory Store
// Provides seamless, robust data matching Spring Boot DTOs and MongoDB collections exactly.
import { calculateAccurateResumeAnalysis } from '../utils/resumeParser';

let CURRENT_USER_RESUME_ANALYSIS = null;

const getStoredSessionUser = () => {
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
};

export const USERS_DATABASE = {
  'demo@example.com': {
    id: 'user_demo_01',
    fullName: 'Alex Rivera',
    email: 'demo@example.com',
    role: 'ROLE_USER',
    phone: '+91 9876543210',
    education: 'Undergraduate (Final Year)',
    college: 'National Institute of Technology',
    degree: 'B.Tech in Computer Science and Engineering',
    branch: 'Computer Science',
    graduationYear: 2026,
    cgpa: 8.85,
    interests: ['Full Stack Web', 'Distributed Systems', 'Cloud Computing', 'AI Integration'],
    certifications: [
      { name: 'Oracle Certified Java Associate', issuer: 'Oracle', year: 2024, url: 'https://oracle.com/cert/123' },
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: 2025, url: 'https://aws.amazon.com/cert/456' }
    ],
    preferredDomain: 'Software Engineering',
    preferredRole: 'Full Stack Java Developer',
    preferredLocation: 'Bengaluru / Hybrid',
    preferredWorkMode: 'Hybrid',
    experienceLevel: 'Fresher / Entry Level',
    careerGoals: 'Aspiring to architect scalable enterprise cloud-native applications and lead engineering teams.',
    profileCompletion: 92,
    createdAt: '2026-01-15T09:00:00'
  }
};

export const getActiveUser = (email) => {
  const sessionUser = getStoredSessionUser();
  if (email && USERS_DATABASE[email.toLowerCase().trim()]) {
    return USERS_DATABASE[email.toLowerCase().trim()];
  }
  if (sessionUser && sessionUser.email) {
    if (USERS_DATABASE[sessionUser.email.toLowerCase().trim()]) {
      return USERS_DATABASE[sessionUser.email.toLowerCase().trim()];
    }
    return sessionUser;
  }
  return USERS_DATABASE['demo@example.com'];
};

// 30+ Core Technical Skills
export const MOCK_SKILLS = [
  { id: 'sk_1', skillName: 'Java', category: 'Programming', proficiencyLevel: 'Advanced', description: 'Core OOP, Collections, Concurrency, JVM internals', verified: true },
  { id: 'sk_2', skillName: 'Python', category: 'Programming', proficiencyLevel: 'Intermediate', description: 'Data processing, backend scripting, machine learning', verified: true },
  { id: 'sk_3', skillName: 'JavaScript', category: 'Programming', proficiencyLevel: 'Advanced', description: 'Modern ES6+, async/await, DOM manipulation', verified: true },
  { id: 'sk_4', skillName: 'TypeScript', category: 'Programming', proficiencyLevel: 'Intermediate', description: 'Static typing, interfaces, generics for scalable frontend/backend', verified: true },
  { id: 'sk_5', skillName: 'C++', category: 'Programming', proficiencyLevel: 'Intermediate', description: 'Low-level systems programming, STL, memory optimization', verified: true },
  { id: 'sk_6', skillName: 'React', category: 'Web Development', proficiencyLevel: 'Advanced', description: 'Hooks, virtual DOM, component architecture, state management', verified: true },
  { id: 'sk_7', skillName: 'Angular', category: 'Web Development', proficiencyLevel: 'Beginner', description: 'Enterprise frontend framework, RxJS, TypeScript', verified: false },
  { id: 'sk_8', skillName: 'Node.js', category: 'Web Development', proficiencyLevel: 'Intermediate', description: 'Event-driven JavaScript runtime for backend services', verified: true },
  { id: 'sk_9', skillName: 'Spring Boot', category: 'Web Development', proficiencyLevel: 'Intermediate', description: 'Enterprise Java REST APIs, microservices, JPA/Hibernate', verified: true },
  { id: 'sk_10', skillName: 'REST API', category: 'Web Development', proficiencyLevel: 'Advanced', description: 'Stateless HTTP protocol, JSON serialization, status codes', verified: true },
  { id: 'sk_11', skillName: 'HTML', category: 'Web Development', proficiencyLevel: 'Advanced', description: 'Semantic markup, accessibility standards, SEO optimization', verified: true },
  { id: 'sk_12', skillName: 'CSS', category: 'Web Development', proficiencyLevel: 'Advanced', description: 'Responsive layouts, Flexbox, Grid, animations, CSS modules', verified: true },
  { id: 'sk_13', skillName: 'SQL', category: 'Database', proficiencyLevel: 'Intermediate', description: 'Relational database querying, normalization, indexing, joins', verified: true },
  { id: 'sk_14', skillName: 'MongoDB', category: 'Database', proficiencyLevel: 'Intermediate', description: 'NoSQL document store, aggregation pipelines, schema modeling', verified: true },
  { id: 'sk_15', skillName: 'MySQL', category: 'Database', proficiencyLevel: 'Intermediate', description: 'Structured relational storage, transactions, foreign keys', verified: true },
  { id: 'sk_16', skillName: 'PostgreSQL', category: 'Database', proficiencyLevel: 'Intermediate', description: 'Advanced open-source relational database with JSON/spatial support', verified: true },
  { id: 'sk_17', skillName: 'Git', category: 'DevOps', proficiencyLevel: 'Advanced', description: 'Version control, branching strategies, rebase, merge conflict resolution', verified: true },
  { id: 'sk_18', skillName: 'GitHub', category: 'DevOps', proficiencyLevel: 'Advanced', description: 'Pull requests, code reviews, Actions CI/CD workflows', verified: true },
  { id: 'sk_19', skillName: 'Docker', category: 'DevOps', proficiencyLevel: 'Intermediate', description: 'Containerization, Dockerfiles, compose, multi-stage builds', verified: true },
  { id: 'sk_20', skillName: 'Kubernetes', category: 'DevOps', proficiencyLevel: 'Beginner', description: 'Container orchestration, pods, deployments, service meshes', verified: false },
  { id: 'sk_21', skillName: 'AWS', category: 'Cloud', proficiencyLevel: 'Intermediate', description: 'EC2, S3, RDS, Lambda, VPC cloud infrastructure', verified: true },
  { id: 'sk_22', skillName: 'Azure', category: 'Cloud', proficiencyLevel: 'Beginner', description: 'Microsoft cloud services, Azure App Services, Blob storage', verified: false },
  { id: 'sk_23', skillName: 'Linux', category: 'DevOps', proficiencyLevel: 'Intermediate', description: 'Shell scripting, bash utilities, process management, permissions', verified: true },
  { id: 'sk_24', skillName: 'Data Structures', category: 'Programming', proficiencyLevel: 'Advanced', description: 'Trees, Graphs, HashTables, Heaps, algorithmic analysis', verified: true },
  { id: 'sk_25', skillName: 'Algorithms', category: 'Programming', proficiencyLevel: 'Intermediate', description: 'Sorting, dynamic programming, backtracking, greedy approaches', verified: true },
  { id: 'sk_26', skillName: 'Machine Learning', category: 'AI/ML', proficiencyLevel: 'Beginner', description: 'Supervised/unsupervised algorithms, scikit-learn, classification', verified: false },
  { id: 'sk_27', skillName: 'Data Analysis', category: 'Data', proficiencyLevel: 'Intermediate', description: 'Exploratory data analysis, statistics, trend discovery', verified: true },
  { id: 'sk_28', skillName: 'Power BI', category: 'Data', proficiencyLevel: 'Beginner', description: 'Visual interactive BI dashboards, DAX queries', verified: false },
  { id: 'sk_29', skillName: 'Tableau', category: 'Data', proficiencyLevel: 'Beginner', description: 'Data storytelling, visual analytics charts, executive metrics', verified: false },
  { id: 'sk_30', skillName: 'Selenium', category: 'Testing', proficiencyLevel: 'Intermediate', description: 'Automated browser testing and test framework integration', verified: true },
  { id: 'sk_31', skillName: 'Communication', category: 'Soft Skills', proficiencyLevel: 'Advanced', description: 'Technical documentation, team collaboration, presentations', verified: true }
];

// 10+ Complete Careers
export const MOCK_CAREERS = [
  {
    id: 'c_1',
    title: 'Full Stack Java Developer',
    domain: 'Software Engineering',
    description: 'Design and implement end-to-end enterprise web applications utilizing Spring Boot microservices on the backend and React on the client tier.',
    salaryRange: '₹8.5 LPA - ₹18.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'React', 'REST API', 'Git'],
    preferredSkills: ['Docker', 'MongoDB', 'AWS', 'CI/CD'],
    responsibilities: [
      'Design and build high-throughput microservices in Spring Boot',
      'Develop reactive, glassmorphic responsive client apps in React',
      'Optimize database queries, indexing, and transaction boundaries',
      'Implement stateless JWT token authentication and role guards',
      'Write comprehensive JUnit tests and API documentation'
    ],
    careerProgression: ['Junior Developer', 'Full Stack Engineer', 'Senior Full Stack Lead', 'Principal Architect'],
    marketDemand: 'Very High',
    growthOutlook: '+24% annual industry expansion across FinTech, SaaS, and Cloud Enterprise.'
  },
  {
    id: 'c_2',
    title: 'Frontend React Specialist',
    domain: 'Frontend Engineering',
    description: 'Craft high-performance, accessible, and responsive user experiences using React, modern JavaScript, TypeScript, and CSS architecture.',
    salaryRange: '₹7.0 LPA - ₹16.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Git'],
    preferredSkills: ['GraphQL', 'Next.js', 'Tailwind CSS', 'Docker'],
    responsibilities: [
      'Translate UX prototypes into pixel-perfect modular components',
      'Optimize Web Vitals, code splitting, and bundle payloads',
      'Integrate backend REST and GraphQL data streams',
      'Ensure WCAG accessibility compliance across devices',
      'Architect resilient client-side state with Context API / Redux'
    ],
    careerProgression: ['Junior Frontend Dev', 'Senior UI Engineer', 'Frontend Lead', 'Head of UX & Frontend'],
    marketDemand: 'High',
    growthOutlook: '+20% annual expansion driven by digital web modernization.'
  },
  {
    id: 'c_3',
    title: 'Backend Services Engineer',
    domain: 'Backend Engineering',
    description: 'Build fault-tolerant, high-throughput microservices, transaction management systems, and enterprise data persistence layers.',
    salaryRange: '₹8.0 LPA - ₹17.5 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST API', 'PostgreSQL', 'Git'],
    preferredSkills: ['Docker', 'Kubernetes', 'MongoDB', 'AWS'],
    responsibilities: [
      'Implement business logic and data persistence pipelines',
      'Ensure strict endpoint security and token validation',
      'Tune database query execution plans and caching strategies',
      'Build resilient asynchronous message consumers',
      'Implement system telemetry, metrics, and health endpoints'
    ],
    careerProgression: ['Backend Developer', 'Senior Backend Engineer', 'Staff Engineer', 'Principal Architect'],
    marketDemand: 'Very High',
    growthOutlook: '+22% growth with cloud-native migration.'
  },
  {
    id: 'c_4',
    title: 'Cloud & DevOps Engineer',
    domain: 'Cloud & Infrastructure',
    description: 'Automate continuous integration/continuous delivery pipelines, infrastructure as code, and cloud cluster monitoring on AWS/Azure.',
    salaryRange: '₹9.0 LPA - ₹20.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD', 'Linux'],
    preferredSkills: ['Python', 'SQL', 'Azure', 'TypeScript'],
    responsibilities: [
      'Automate container builds and multi-stage deployments',
      'Manage cloud infrastructure resources and VPC routing',
      'Implement automated observability, alerts, and auto-scaling',
      'Enforce security best practices across CI/CD pipelines',
      'Maintain 99.99% high availability and disaster recovery drills'
    ],
    careerProgression: ['DevOps Associate', 'Cloud Engineer', 'Lead SRE', 'Cloud Solutions Architect'],
    marketDemand: 'Very High',
    growthOutlook: '+28% enterprise adoption rate.'
  },
  {
    id: 'c_5',
    title: 'Data Analyst & BI Specialist',
    domain: 'Data & Analytics',
    description: 'Transform raw business data into actionable visual dashboards, statistical reports, and predictive trend models.',
    salaryRange: '₹6.5 LPA - ₹14.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['SQL', 'Python', 'Data Structures', 'Data Analysis'],
    preferredSkills: ['Power BI', 'Tableau', 'Machine Learning', 'PostgreSQL'],
    responsibilities: [
      'Extract and clean datasets from relational and NoSQL databases',
      'Build interactive reporting dashboards in BI tools',
      'Collaborate with product leaders on KPI discovery',
      'Perform cohort and correlation analysis on business trends',
      'Automate scheduled report generation pipelines'
    ],
    careerProgression: ['Data Analyst', 'Senior Analyst', 'Analytics Manager', 'VP of Business Intelligence'],
    marketDemand: 'High',
    growthOutlook: '+25% expansion across e-commerce and finance.'
  },
  {
    id: 'c_6',
    title: 'AI / Machine Learning Engineer',
    domain: 'Artificial Intelligence',
    description: 'Develop, evaluate, and deploy neural networks, natural language processing pipelines, and predictive intelligence models.',
    salaryRange: '₹10.0 LPA - ₹22.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['Python', 'Machine Learning', 'Data Structures', 'Algorithms'],
    preferredSkills: ['Docker', 'AWS', 'SQL', 'Git'],
    responsibilities: [
      'Train and fine-tune machine learning models on structured/unstructured datasets',
      'Perform feature engineering and dimensionality reduction',
      'Expose optimized inference endpoints via REST APIs',
      'Evaluate model bias, accuracy, and drift metrics',
      'Deploy containerized models to scalable cloud servers'
    ],
    careerProgression: ['ML Engineer', 'Senior AI Engineer', 'Chief Data Scientist', 'Head of AI'],
    marketDemand: 'Extremely High',
    growthOutlook: '+34% explosive expansion globally.'
  },
  {
    id: 'c_7',
    title: 'Database Administrator & Developer',
    domain: 'Database Management',
    description: 'Design robust relational and NoSQL schemas, guarantee 99.99% uptime, backup strategies, and query performance tuning.',
    salaryRange: '₹7.5 LPA - ₹15.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL'],
    preferredSkills: ['Linux', 'Docker', 'Python', 'Git'],
    responsibilities: [
      'Manage database replication, indexing, and sharding',
      'Maintain rigorous data backup and point-in-time recovery',
      'Analyze slow-running queries and optimize execution plans',
      'Ensure data integrity, encryption at rest, and role permissions',
      'Perform database version upgrades and schema migrations'
    ],
    careerProgression: ['Junior DBA', 'Senior Database Engineer', 'Lead Data Infrastructure Architect'],
    marketDemand: 'Moderate to High',
    growthOutlook: '+15% steady demand for enterprise data reliability.'
  },
  {
    id: 'c_8',
    title: 'QA & Test Automation Engineer',
    domain: 'Quality Engineering',
    description: 'Ensure product quality and reliability through automated end-to-end testing suites, performance benchmarking, and CI integration.',
    salaryRange: '₹6.0 LPA - ₹13.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['Java', 'Selenium', 'JavaScript', 'Git', 'REST API'],
    preferredSkills: ['CI/CD', 'Docker', 'Python', 'SQL'],
    responsibilities: [
      'Author automated end-to-end regression test suites',
      'Integrate test runs into automated CI/CD pull request gates',
      'Perform load, stress, and API contract validation',
      'Identify, document, and track software defects in Jira',
      'Collaborate with developers to expand unit test coverage'
    ],
    careerProgression: ['QA Tester', 'Automation Lead', 'Quality Director', 'VP of Quality Assurance'],
    marketDemand: 'High',
    growthOutlook: '+18% steady enterprise expansion.'
  },
  {
    id: 'c_9',
    title: 'Python Developer',
    domain: 'Software Engineering',
    description: 'Build scalable backend web applications, automation scripts, and RESTful APIs using Python, Django, Flask, and FastAPI.',
    salaryRange: '₹7.5 LPA - ₹16.5 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['Python', 'SQL', 'REST API', 'Git', 'HTML', 'CSS'],
    preferredSkills: ['Docker', 'MongoDB', 'AWS', 'PostgreSQL'],
    responsibilities: [
      'Develop backend APIs using modern Python web frameworks',
      'Integrate relational and NoSQL databases',
      'Automate background tasks and data ETL workflows',
      'Write modular, test-driven Python code',
      'Deploy applications with Docker containerization'
    ],
    careerProgression: ['Python Developer', 'Senior Python Engineer', 'Backend Lead', 'Engineering Manager'],
    marketDemand: 'Very High',
    growthOutlook: '+26% demand in web, fintech, and data pipelines.'
  },
  {
    id: 'c_10',
    title: 'Mobile Application Developer',
    domain: 'Mobile Engineering',
    description: 'Build engaging cross-platform mobile applications for iOS and Android with fluid responsive user interfaces and offline caching.',
    salaryRange: '₹7.0 LPA - ₹16.0 LPA',
    experienceLevel: 'Fresher / Entry Level',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'REST API', 'Git'],
    preferredSkills: ['Java', 'HTML', 'CSS', 'Docker'],
    responsibilities: [
      'Develop mobile applications using React Native / cross-platform SDKs',
      'Integrate native device sensors, biometric auth, and push notifications',
      'Optimize mobile UI rendering and battery consumption',
      'Manage Google Play Store and Apple App Store release pipelines',
      'Implement secure offline storage and network synchronization'
    ],
    careerProgression: ['Junior Mobile Developer', 'Senior Mobile Engineer', 'Mobile Architect'],
    marketDemand: 'High',
    growthOutlook: '+22% growth driven by consumer apps.'
  }
];

// 15+ Verified Jobs
export const MOCK_JOBS = [
  {
    id: 'job_1',
    title: 'Junior Java Full Stack Developer',
    company: 'Infosys Technologies',
    location: 'Bengaluru, Karnataka',
    workMode: 'Hybrid',
    experience: 'Fresher (0-1 yr)',
    skills: ['Java', 'Spring Boot', 'SQL', 'React', 'Git'],
    salary: '₹6.5 - ₹9.0 LPA',
    description: 'Join our Global Digital Engineering unit to build scalable customer-facing banking applications.',
    applicationUrl: 'https://careers.infosys.com'
  },
  {
    id: 'job_2',
    title: 'Associate Software Engineer - React',
    company: 'TCS Interactive',
    location: 'Hyderabad, Telangana',
    workMode: 'Hybrid',
    experience: 'Fresher (0-2 yrs)',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    salary: '₹5.5 - ₹8.0 LPA',
    description: 'Develop modern responsive dashboards and interactive client portals for international retail clients.',
    applicationUrl: 'https://www.tcs.com/careers'
  },
  {
    id: 'job_3',
    title: 'Backend Platform Engineer',
    company: 'Microsoft Corporation',
    location: 'Hyderabad / Bengaluru',
    workMode: 'Hybrid',
    experience: '0-2 years',
    skills: ['Java', 'Spring Boot', 'SQL', 'REST API', 'Docker'],
    salary: '₹14.0 - ₹22.0 LPA',
    description: 'Collaborate with the Azure Services team to build mission-critical distributed backend APIs.',
    applicationUrl: 'https://careers.microsoft.com'
  },
  {
    id: 'job_4',
    title: 'Cloud DevOps Engineer',
    company: 'Amazon Web Services',
    location: 'Bengaluru, Karnataka',
    workMode: 'Onsite',
    experience: '0-1 year',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Git'],
    salary: '₹16.0 - ₹24.0 LPA',
    description: 'Manage global container infrastructure and automated continuous deployment workflows.',
    applicationUrl: 'https://amazon.jobs'
  },
  {
    id: 'job_5',
    title: 'Data Analyst Associate',
    company: 'Deloitte Consulting',
    location: 'Pune, Maharashtra',
    workMode: 'Hybrid',
    experience: 'Fresher / 0-1 yr',
    skills: ['SQL', 'Python', 'Data Structures', 'Data Analysis'],
    salary: '₹7.0 - ₹10.5 LPA',
    description: 'Extract business insights and author predictive reporting models for global enterprise clients.',
    applicationUrl: 'https://www2.deloitte.com/careers'
  },
  {
    id: 'job_6',
    title: 'Junior Machine Learning Engineer',
    company: 'Fractal Analytics',
    location: 'Bengaluru, Karnataka',
    workMode: 'Hybrid',
    experience: '0-2 years',
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Structures'],
    salary: '₹9.0 - ₹14.0 LPA',
    description: 'Build predictive AI models and vector embeddings for Fortune 500 decision intelligence platforms.',
    applicationUrl: 'https://fractal.ai/careers'
  },
  {
    id: 'job_7',
    title: 'Database Reliability Engineer',
    company: 'Oracle India',
    location: 'Bengaluru, Karnataka',
    workMode: 'Onsite',
    experience: 'Fresher / 0-2 yrs',
    skills: ['SQL', 'MongoDB', 'PostgreSQL', 'Linux'],
    salary: '₹8.5 - ₹13.5 LPA',
    description: 'Maintain high availability and performance tuning across enterprise cloud database nodes.',
    applicationUrl: 'https://www.oracle.com/careers'
  },
  {
    id: 'job_8',
    title: 'QA Automation Engineer',
    company: 'Wipro Digital',
    location: 'Chennai, Tamil Nadu',
    workMode: 'Hybrid',
    experience: '0-2 years',
    skills: ['Java', 'Selenium', 'JavaScript', 'Git'],
    salary: '₹5.0 - ₹7.5 LPA',
    description: 'Design robust automated test suites and continuous quality gates for e-commerce clients.',
    applicationUrl: 'https://careers.wipro.com'
  },
  {
    id: 'job_9',
    title: 'Associate Python Web Developer',
    company: 'Zoho Corporation',
    location: 'Chennai, Tamil Nadu',
    workMode: 'Onsite',
    experience: '0-1 year',
    skills: ['Python', 'SQL', 'REST API', 'Git', 'HTML'],
    salary: '₹6.5 - ₹10.0 LPA',
    description: 'Engineer responsive backend services and modular apps for the Zoho SaaS cloud suite.',
    applicationUrl: 'https://www.zoho.com/careers'
  },
  {
    id: 'job_10',
    title: 'Frontend Developer - Mobile/Web',
    company: 'Swiggy',
    location: 'Bengaluru, Karnataka',
    workMode: 'Remote',
    experience: '0-2 years',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
    salary: '₹10.0 - ₹16.0 LPA',
    description: 'Craft consumer-facing web and mobile views for live food delivery and quick-commerce tracking.',
    applicationUrl: 'https://careers.swiggy.com'
  }
];

// 15+ Verified Internships
export const MOCK_INTERNSHIPS = [
  {
    id: 'int_1',
    title: 'Full Stack Java Engineering Intern',
    company: 'Microsoft India',
    location: 'Hyderabad / Hybrid',
    duration: '6 Months',
    stipend: '₹50,000 / month',
    workMode: 'Hybrid',
    skills: ['Java', 'Spring Boot', 'React', 'SQL', 'Git'],
    description: 'Collaborate with Azure Cloud dev tools teams to build developer portals and real-time telemetry tools.',
    applicationUrl: 'https://careers.microsoft.com'
  },
  {
    id: 'int_2',
    title: 'Frontend React Developer Intern',
    company: 'Flipkart',
    location: 'Bengaluru, Karnataka',
    duration: '6 Months',
    stipend: '₹45,000 / month',
    workMode: 'Hybrid',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    description: 'Build intuitive checkout components, interactive product showcases, and mobile-first micro-interactions.',
    applicationUrl: 'https://www.flipkartcareers.com'
  },
  {
    id: 'int_3',
    title: 'Cloud & DevOps Intern',
    company: 'Amazon India',
    location: 'Bengaluru, Karnataka',
    duration: '6 Months',
    stipend: '₹60,000 / month',
    workMode: 'Onsite',
    skills: ['AWS', 'Docker', 'Linux', 'Git'],
    description: 'Work with AWS Infrastructure teams on container orchestration pipelines and deployment automation.',
    applicationUrl: 'https://amazon.jobs'
  },
  {
    id: 'int_4',
    title: 'Data Science & Analytics Intern',
    company: 'Swiggy',
    location: 'Bengaluru / Remote',
    duration: '3 Months',
    stipend: '₹35,000 / month',
    workMode: 'Remote',
    skills: ['Python', 'SQL', 'Data Structures', 'Data Analysis'],
    description: 'Analyze hyper-local demand forecasting and author real-time delivery route optimization queries.',
    applicationUrl: 'https://careers.swiggy.com'
  },
  {
    id: 'int_5',
    title: 'Software Development Intern (Java/Backend)',
    company: 'Oracle India',
    location: 'Bengaluru, Karnataka',
    duration: '6 Months',
    stipend: '₹40,000 / month',
    workMode: 'Onsite',
    skills: ['Java', 'SQL', 'REST API', 'Git'],
    description: 'Engineer high-performance cloud persistence services and microservices connectors.',
    applicationUrl: 'https://www.oracle.com/careers'
  },
  {
    id: 'int_6',
    title: 'AI/ML Research Intern',
    company: 'Adobe Systems',
    location: 'Noida, Uttar Pradesh',
    duration: '6 Months',
    stipend: '₹55,000 / month',
    workMode: 'Hybrid',
    skills: ['Python', 'Machine Learning', 'Algorithms'],
    description: 'Experiment with computer vision and document intelligence models for creative cloud platforms.',
    applicationUrl: 'https://www.adobe.com/careers'
  },
  {
    id: 'int_7',
    title: 'Database Developer Intern',
    company: 'MongoDB India',
    location: 'Gurugram / Remote',
    duration: '3 Months',
    stipend: '₹45,000 / month',
    workMode: 'Remote',
    skills: ['MongoDB', 'SQL', 'JavaScript', 'Python'],
    description: 'Build database benchmarking scripts and documentation for modern document aggregation workflows.',
    applicationUrl: 'https://www.mongodb.com/careers'
  },
  {
    id: 'int_8',
    title: 'QA Automation Intern',
    company: 'Paytm Payments',
    location: 'Noida, Uttar Pradesh',
    duration: '4 Months',
    stipend: '₹25,000 / month',
    workMode: 'Hybrid',
    skills: ['Java', 'Selenium', 'Git'],
    description: 'Automate payment gateway transaction regression suites and performance stress tests.',
    applicationUrl: 'https://paytm.com/careers'
  }
];

// 30+ Curated Learning Resources
export const MOCK_RESOURCES = [
  { id: 'res_1', title: 'Java Programming Masterclass 2026', platform: 'Coursera / Udemy', url: 'https://www.coursera.org', skillCovered: 'Java', difficulty: 'Beginner to Intermediate', estimatedDuration: '30 Hours', type: 'Course' },
  { id: 'res_2', title: 'Spring Boot 3 & Microservices Architecture', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org', skillCovered: 'Spring Boot', difficulty: 'Intermediate', estimatedDuration: '20 Hours', type: 'Video' },
  { id: 'res_3', title: 'Complete React 18 & State Management', platform: 'React Official Docs', url: 'https://react.dev', skillCovered: 'React', difficulty: 'Beginner to Advanced', estimatedDuration: '16 Hours', type: 'Documentation' },
  { id: 'res_4', title: 'Docker & Containerization Deep Dive', platform: 'Docker Official Docs', url: 'https://docs.docker.com', skillCovered: 'Docker', difficulty: 'Intermediate', estimatedDuration: '8 Hours', type: 'Documentation' },
  { id: 'res_5', title: 'Interactive SQL Query Mastery', platform: 'SQLBolt', url: 'https://sqlbolt.com', skillCovered: 'SQL', difficulty: 'Beginner', estimatedDuration: '6 Hours', type: 'Tutorial' },
  { id: 'res_6', title: 'MongoDB University: Developer Path', platform: 'MongoDB University', url: 'https://learn.mongodb.com', skillCovered: 'MongoDB', difficulty: 'Intermediate', estimatedDuration: '12 Hours', type: 'Course' },
  { id: 'res_7', title: 'Kubernetes for Developers Hands-on', platform: 'Kubernetes.io', url: 'https://kubernetes.io/docs/tutorials/', skillCovered: 'Kubernetes', difficulty: 'Advanced', estimatedDuration: '15 Hours', type: 'Tutorial' },
  { id: 'res_8', title: 'AWS Cloud Practitioner Essentials', platform: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws', skillCovered: 'AWS', difficulty: 'Beginner', estimatedDuration: '10 Hours', type: 'Course' },
  { id: 'res_9', title: 'Data Structures & Algorithms in Java', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org', skillCovered: 'Data Structures', difficulty: 'Intermediate to Advanced', estimatedDuration: '40 Hours', type: 'Practice' },
  { id: 'res_10', title: 'Machine Learning Specialization', platform: 'DeepLearning.AI', url: 'https://www.deeplearning.ai', skillCovered: 'Machine Learning', difficulty: 'Intermediate', estimatedDuration: '35 Hours', type: 'Course' },
  { id: 'res_11', title: 'JavaScript: The Hard Parts', platform: 'Frontend Masters', url: 'https://frontendmasters.com', skillCovered: 'JavaScript', difficulty: 'Intermediate', estimatedDuration: '12 Hours', type: 'Video' },
  { id: 'res_12', title: 'TypeScript Handbook & Interactive Playground', platform: 'TypeScriptLang', url: 'https://www.typescriptlang.org', skillCovered: 'TypeScript', difficulty: 'Intermediate', estimatedDuration: '8 Hours', type: 'Documentation' }
];

// Helper to generate a complete multi-phase roadmap for any career
export const generateRoadmapForCareer = (careerId, careerTitle, userSkills = ['Java', 'SQL', 'HTML', 'CSS', 'React', 'JavaScript', 'Git']) => {
  const career = MOCK_CAREERS.find(c => c.id === careerId) || MOCK_CAREERS[0];
  const req = career.requiredSkills || ['Java', 'Spring Boot', 'SQL', 'React', 'Git'];

  const s1 = req[0] || 'Fundamentals';
  const s2 = req[1] || 'Core Framework';
  const s3 = req[2] || 'Databases';
  const s4 = req[3] || 'Advanced Architecture';
  const s5 = req[4] || 'DevOps & Deployment';

  return {
    id: `rd_${career.id}`,
    userId: 'user_active',
    careerId: career.id,
    careerTitle: career.title,
    progressPercentage: 45,
    completedTasks: ['t1', 't2', 't4'],
    phases: [
      {
        phaseId: 'p1',
        title: `Phase 1: Foundations & Core Logic in ${s1}`,
        description: 'Master syntax, programming paradigms, and fundamental problem-solving.',
        estimatedDuration: '4 Weeks',
        skills: [s1, 'Problem Solving', 'Git'],
        tasks: [
          { taskId: 't1', title: `Understand variables, control flow, and data types in ${s1}`, completed: true },
          { taskId: 't2', title: 'Solve 10 algorithmic problems on HackerRank / LeetCode', completed: true },
          { taskId: 't3', title: 'Configure Git version control and initialize GitHub repositories', completed: false }
        ],
        resources: ['Official Documentation', 'freeCodeCamp Interactive Tutorials']
      },
      {
        phaseId: 'p2',
        title: `Phase 2: Database Schema & Persistent Storage with ${s3}`,
        description: 'Design structured relational models, write complex queries, and index data.',
        estimatedDuration: '3 Weeks',
        skills: [s3, 'MongoDB', 'Indexing'],
        tasks: [
          { taskId: 't4', title: `Master relational schema design, JOINs, and indexing in ${s3}`, completed: true },
          { taskId: 't5', title: 'Implement CRUD operations and transactions', completed: false },
          { taskId: 't6', title: 'Connect backend persistence layers and ORM mappings', completed: false }
        ],
        resources: ['SQLBolt Interactive Guides', 'MongoDB University Essentials']
      },
      {
        phaseId: 'p3',
        title: `Phase 3: Frameworks & Enterprise Web APIs (${s2})`,
        description: 'Build scalable backend services, stateless REST endpoints, and security layers.',
        estimatedDuration: '5 Weeks',
        skills: [s2, 'REST API', 'Security & JWT'],
        tasks: [
          { taskId: 't7', title: `Construct robust RESTful API endpoints in ${s2}`, completed: false },
          { taskId: 't8', title: 'Implement stateless JWT token authentication and role guards', completed: false },
          { taskId: 't9', title: 'Handle errors globally and write unit testing suites', completed: false }
        ],
        resources: ['Spring Boot Guides', 'REST API Best Practice Design']
      },
      {
        phaseId: 'p4',
        title: `Phase 4: Full-Stack Integration & Client UI (${s4})`,
        description: 'Connect interactive client interfaces, state architecture, and micro-interactions.',
        estimatedDuration: '4 Weeks',
        skills: [s4, 'State Management', 'System Design'],
        tasks: [
          { taskId: 't10', title: `Connect dynamic client views with ${s4}`, completed: false },
          { taskId: 't11', title: 'Implement global state management and caching strategies', completed: false },
          { taskId: 't12', title: 'Optimize frontend Web Vitals and accessibility', completed: false }
        ],
        resources: ['React Official Docs', 'System Design Primer']
      },
      {
        phaseId: 'p5',
        title: `Phase 5: Cloud Deployment & CI/CD Pipelines (${s5})`,
        description: 'Containerize services, configure automated testing, and monitor cloud health.',
        estimatedDuration: '3 Weeks',
        skills: [s5, 'Docker', 'AWS'],
        tasks: [
          { taskId: 't13', title: `Containerize full-stack application using Docker multi-stage builds`, completed: false },
          { taskId: 't14', title: 'Configure automated CI/CD testing with GitHub Actions', completed: false },
          { taskId: 't15', title: 'Deploy live application to cloud servers (AWS / Render)', completed: false }
        ],
        resources: ['Docker Documentation', 'Cloud Architecture Whitepapers']
      }
    ]
  };
};

export const formatCareerMatch = (career, userSkills = ['Java', 'SQL', 'HTML', 'CSS', 'React', 'JavaScript', 'Git']) => {
  const req = career.requiredSkills || [];
  const normalizedUser = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const matching = req.filter(s => normalizedUser.has(s.toLowerCase().trim()));
  const missing = req.filter(s => !normalizedUser.has(s.toLowerCase().trim()));
  const score = Math.min(95, Math.max(35, Math.round((matching.length / (req.length || 1)) * 60 + 35)));

  return {
    career,
    matchPercentage: score,
    matchingSkills: matching,
    missingSkills: missing,
    matchReason: `Matches ${matching.length} of ${req.length} required skills with strong domain alignment.`
  };
};

export const formatJobDto = (job, userSkills = ['Java', 'SQL', 'HTML', 'CSS', 'React', 'JavaScript', 'Git'], isSaved = false) => {
  const req = job.skills || [];
  const normalizedUser = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const matching = req.filter(s => normalizedUser.has(s.toLowerCase().trim()));
  const missing = req.filter(s => !normalizedUser.has(s.toLowerCase().trim()));
  const score = Math.min(98, Math.max(50, Math.round((matching.length / (req.length || 1)) * 50 + 45)));

  return {
    job,
    matchPercentage: score,
    matchingSkills: matching,
    missingSkills: missing,
    isSaved
  };
};

export const formatInternshipDto = (internship, userSkills = ['Java', 'SQL', 'HTML', 'CSS', 'React', 'JavaScript', 'Git'], isSaved = false) => {
  const req = internship.skills || [];
  const normalizedUser = new Set(userSkills.map(s => s.toLowerCase().trim()));
  const matching = req.filter(s => normalizedUser.has(s.toLowerCase().trim()));
  const missing = req.filter(s => !normalizedUser.has(s.toLowerCase().trim()));
  const score = Math.min(96, Math.max(55, Math.round((matching.length / (req.length || 1)) * 50 + 48)));

  return {
    internship,
    matchPercentage: score,
    matchingSkills: matching,
    missingSkills: missing,
    isSaved
  };
};

function cleanNameFromEmail(email) {
  if (!email) return 'Career Explorer';
  const prefix = email.split('@')[0];
  const capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  return capitalized.replace(/[._0-9]+/g, ' ').trim() || prefix;
}

// In-Memory dynamic roadmap state store
const USER_ROADMAPS = {};

export function handleMockRoute(endpoint, method = 'GET', body = null) {
  // Auth: Login
  if (endpoint.includes('/api/auth/login')) {
    const email = body?.email ? body.email.trim().toLowerCase() : 'demo@example.com';
    let userObj = USERS_DATABASE[email];

    if (!userObj) {
      userObj = {
        id: 'user_' + Date.now(),
        fullName: cleanNameFromEmail(email),
        email: email,
        role: 'ROLE_USER',
        phone: '+91 9876543210',
        education: 'Undergraduate',
        college: 'University',
        degree: 'B.Tech Computer Science',
        branch: 'Computer Science',
        graduationYear: 2026,
        cgpa: 8.5,
        interests: ['Software Development', 'Cloud Systems'],
        certifications: [],
        preferredDomain: 'Software Engineering',
        preferredRole: 'Full Stack Developer',
        preferredLocation: 'Bengaluru / Remote',
        preferredWorkMode: 'Hybrid',
        experienceLevel: 'Fresher / Entry Level',
        careerGoals: 'Excel in full stack software engineering and cloud infrastructure.',
        profileCompletion: 85,
        createdAt: new Date().toISOString()
      };
      USERS_DATABASE[email] = userObj;
    }

    return {
      token: 'jwt_token_' + Date.now(),
      id: userObj.id,
      fullName: userObj.fullName,
      email: userObj.email,
      role: userObj.role,
      message: 'Welcome, ' + userObj.fullName + '!'
    };
  }

  // Auth: Register
  if (endpoint.includes('/api/auth/register')) {
    const email = body?.email ? body.email.trim().toLowerCase() : 'user@example.com';
    const fullName = body?.fullName ? body.fullName.trim() : cleanNameFromEmail(email);

    const newUser = {
      id: 'user_' + Date.now(),
      fullName: fullName,
      email: email,
      role: 'ROLE_USER',
      phone: body?.phone || '',
      education: body?.education || 'Undergraduate',
      college: body?.college || 'University',
      degree: body?.degree || 'B.Tech Computer Science',
      branch: body?.branch || 'Computer Science',
      graduationYear: body?.graduationYear || 2026,
      cgpa: 8.5,
      interests: ['Software Development', 'Cloud Systems'],
      certifications: [],
      preferredDomain: 'Software Engineering',
      preferredRole: 'Full Stack Developer',
      preferredLocation: 'Bengaluru / Hybrid',
      preferredWorkMode: 'Hybrid',
      experienceLevel: 'Fresher',
      careerGoals: 'Excel in full-stack engineering and cloud software.',
      profileCompletion: 85,
      createdAt: new Date().toISOString()
    };

    USERS_DATABASE[email] = newUser;

    return {
      token: 'jwt_token_' + Date.now(),
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      message: 'Registration successful'
    };
  }

  const currentUser = getActiveUser();

  if (endpoint.includes('/api/auth/me') || endpoint.includes('/api/user/profile') || endpoint.includes('/api/users/profile')) {
    if (method === 'PUT' && body) {
      Object.assign(currentUser, body);
      if (currentUser.email) {
        USERS_DATABASE[currentUser.email.toLowerCase()] = { ...currentUser };
      }
    }
    return currentUser;
  }

  // Dashboard Summary
  if (endpoint.includes('/api/dashboard') || endpoint.includes('/api/user/dashboard-summary')) {
    const topMatch = formatCareerMatch(MOCK_CAREERS[0]);
    return {
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      profileCompletion: currentUser.profileCompletion || 85,
      totalSkillsCount: MOCK_SKILLS.length,
      activeSkillGapsCount: topMatch.missingSkills.length,
      roadmapProgressPercentage: 45,
      latestAtsScore: 84,
      savedOpportunitiesCount: 2,
      recommendedCareer: topMatch,
      topCareers: MOCK_CAREERS.map(c => formatCareerMatch(c)),
      recentSkills: MOCK_SKILLS,
      recommendedJobs: MOCK_JOBS.map(j => formatJobDto(j)),
      recommendedInternships: MOCK_INTERNSHIPS.map(i => formatInternshipDto(i))
    };
  }

  // Careers API
  if (endpoint.includes('/api/careers/recommendations')) {
    return MOCK_CAREERS.map(c => formatCareerMatch(c));
  }
  if (endpoint === '/api/careers' || endpoint === '/api/careers/' || endpoint.startsWith('/api/careers?')) {
    return MOCK_CAREERS;
  }
  if (endpoint.startsWith('/api/careers/') && endpoint.endsWith('/match')) {
    const id = endpoint.replace('/api/careers/', '').replace('/match', '');
    const found = MOCK_CAREERS.find(c => c.id === id) || MOCK_CAREERS[0];
    return formatCareerMatch(found);
  }
  if (endpoint.startsWith('/api/careers/')) {
    const id = endpoint.replace('/api/careers/', '');
    return MOCK_CAREERS.find(c => c.id === id) || MOCK_CAREERS[0];
  }

  // Skills API
  if (endpoint.includes('/api/skills')) {
    if (method === 'POST' && body) {
      const newSkill = {
        id: `sk_${Date.now()}`,
        userId: currentUser.id,
        skillName: body.skillName || body.name || 'New Skill',
        category: body.category || 'Programming',
        proficiencyLevel: body.proficiencyLevel || body.proficiency || 'Intermediate',
        description: body.description || 'Custom technical skill',
        verified: true
      };
      MOCK_SKILLS.push(newSkill);
      return newSkill;
    }
    if (method === 'DELETE') {
      return { success: true, message: 'Skill removed' };
    }
    return MOCK_SKILLS;
  }

  // Skill Gap API
  if (endpoint.includes('/api/skill-gap')) {
    const careerId = endpoint.includes('/career/') ? endpoint.split('/career/')[1] : (body?.careerId || MOCK_CAREERS[0].id);
    const career = MOCK_CAREERS.find(c => c.id === careerId) || MOCK_CAREERS[0];
    const match = formatCareerMatch(career);

    const missingDetails = match.missingSkills.map((sk, idx) => ({
      skillName: sk,
      importance: idx < 2 ? 'High' : (idx < 4 ? 'Medium' : 'Foundational'),
      whyRequired: `Core prerequisite for professional ${career.title} project requirements.`,
      recommendedResource: `Curated ${sk} Masterclass & Exercises`,
      estimatedDuration: '2-3 Weeks',
      roadmapPosition: `Phase ${(idx % 4) + 1}`
    }));

    return {
      id: `sg_${career.id}`,
      userId: currentUser.id,
      careerId: career.id,
      careerTitle: career.title,
      requiredSkills: career.requiredSkills,
      userSkills: ['Java', 'SQL', 'HTML', 'CSS', 'React', 'JavaScript', 'Git'],
      matchedSkills: match.matchingSkills,
      missingSkills: missingDetails,
      matchPercentage: match.matchPercentage,
      analyzedAt: new Date().toISOString()
    };
  }

  // Roadmaps API
  if (endpoint.includes('/api/roadmaps')) {
    if (endpoint.includes('/career/')) {
      const cId = endpoint.split('/career/')[1];
      const career = MOCK_CAREERS.find(c => c.id === cId) || MOCK_CAREERS[0];
      if (!USER_ROADMAPS[cId]) {
        USER_ROADMAPS[cId] = generateRoadmapForCareer(career.id, career.title);
      }
      return USER_ROADMAPS[cId];
    }
    if (endpoint.includes('/toggle-task')) {
      const rId = endpoint.split('/api/roadmaps/')[1].split('/toggle-task')[0];
      const taskId = body?.taskId;
      let foundRoadmap = Object.values(USER_ROADMAPS).find(r => r.id === rId) || USER_ROADMAPS['c_1'] || generateRoadmapForCareer('c_1', 'Full Stack Java Developer');

      let totalTasks = 0;
      let completedCount = 0;

      foundRoadmap.phases.forEach(phase => {
        phase.tasks.forEach(t => {
          totalTasks++;
          if (t.taskId === taskId) {
            t.completed = !t.completed;
          }
          if (t.completed) completedCount++;
        });
      });

      foundRoadmap.progressPercentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
      return foundRoadmap;
    }
    if (endpoint.includes('/reset')) {
      const rId = endpoint.split('/api/roadmaps/')[1].split('/reset')[0];
      let foundRoadmap = Object.values(USER_ROADMAPS).find(r => r.id === rId) || USER_ROADMAPS['c_1'] || generateRoadmapForCareer('c_1', 'Full Stack Java Developer');

      foundRoadmap.phases.forEach(phase => {
        phase.tasks.forEach(t => {
          t.completed = false;
        });
      });
      foundRoadmap.progressPercentage = 0;
      foundRoadmap.completedTasks = [];
      return foundRoadmap;
    }
    return [generateRoadmapForCareer('c_1', 'Full Stack Java Developer')];
  }

  // Jobs API
  if (endpoint.includes('/api/jobs')) {
    return MOCK_JOBS.map(j => formatJobDto(j));
  }

  // Internships API
  if (endpoint.includes('/api/internships')) {
    return MOCK_INTERNSHIPS.map(i => formatInternshipDto(i));
  }

  // Resources API
  if (endpoint.includes('/api/resources')) {
    return MOCK_RESOURCES;
  }

  // Resume Analyzer & Job Match API
  if (endpoint.includes('/api/resume/analyze')) {
    const text = body?.resumeText || '';
    const fName = body?.fileName || 'Resume_Document.pdf';
    const analysisResult = calculateAccurateResumeAnalysis(text, fName);
    CURRENT_USER_RESUME_ANALYSIS = analysisResult;
    return analysisResult;
  }

  if (endpoint.includes('/api/resume/latest')) {
    return CURRENT_USER_RESUME_ANALYSIS || null;
  }

  if (endpoint.includes('/api/resume/all')) {
    return CURRENT_USER_RESUME_ANALYSIS ? [CURRENT_USER_RESUME_ANALYSIS] : [];
  }

  if (endpoint.includes('/api/resume/match-job') || endpoint.includes('/api/resume-match/analyze')) {
    const resumeStr = (body?.resumeText || '').toLowerCase();
    const jdStr = (body?.jobDescription || '').toLowerCase();

    const techKeywords = ['Java', 'Spring Boot', 'React', 'SQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Git', 'REST API', 'JavaScript', 'CI/CD'];
    const matched = techKeywords.filter(k => resumeStr.includes(k.toLowerCase()) && jdStr.includes(k.toLowerCase()));
    const missing = techKeywords.filter(k => !resumeStr.includes(k.toLowerCase()) && jdStr.includes(k.toLowerCase()));

    const totalJd = matched.length + missing.length;
    const score = totalJd === 0 ? 82 : Math.min(96, Math.max(40, Math.round((matched.length / totalJd) * 100)));

    return {
      overallMatchPercentage: score,
      matchedSkills: matched.length > 0 ? matched : ['Java', 'SQL', 'Git', 'REST API'],
      missingSkills: missing.length > 0 ? missing : ['Docker', 'Kubernetes', 'AWS'],
      matchingKeywords: matched,
      missingKeywords: missing,
      educationMatchStatus: 'Strong Match (B.Tech in Computer Science meets requirements)',
      experienceMatchStatus: 'Candidate meets entry/intermediate role prerequisites',
      recommendations: [
        'Add measurable performance impacts to technical project descriptions (e.g. "Optimized query latency by 35%")',
        'Incorporate target job keywords: ' + (missing.length > 0 ? missing.join(', ') : 'Docker, Kubernetes, AWS'),
        'Highlight full-stack integration and end-to-end deployment workflows prominently in your resume summary'
      ]
    };
  }

  return { success: true };
}
