const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IntelliFarm — System Architecture & UML Diagrams</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      padding-bottom: 80px;
    }
    /* Sticky Top Header */
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }
    .top-bar-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #1e3a8a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 12px;
      color: var(--text-muted);
    }
    .action-group {
      display: flex;
      gap: 10px;
    }
    .btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn:hover {
      background: var(--primary-hover);
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }

    /* Sub-navigation bar */
    .sub-nav {
      max-width: 1200px;
      margin: 16px auto 24px auto;
      padding: 0 16px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      white-space: nowrap;
    }
    .nav-pill {
      background: white;
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-pill:hover {
      color: var(--primary);
      border-color: var(--primary);
      background: #eff6ff;
    }

    /* Main Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    /* Diagram Card with pure white background */
    .diagram-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      scroll-margin-top: 100px;
    }
    .card-header {
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: #eff6ff;
      color: #2563eb;
      margin-bottom: 6px;
    }
    .diagram-title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }
    .diagram-desc {
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 6px;
      line-height: 1.6;
    }
    .white-canvas {
      background: #ffffff !important;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: auto;
      min-height: 420px;
    }

    /* Print Optimization */
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .top-bar, .sub-nav, .action-group {
        display: none !important;
      }
      .diagram-card {
        box-shadow: none;
        border: none;
        page-break-after: always;
        padding: 20px 0;
      }
      .white-canvas {
        border: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <!-- Top Sticky Header -->
  <header class="top-bar">
    <div class="top-bar-inner">
      <div>
        <div class="brand-title">IntelliFarm — UML Architecture Suite</div>
        <div class="brand-subtitle">High-Definition Diagrams with Pure White Background & Full Specifications</div>
      </div>
      <div class="action-group">
        <button class="btn btn-secondary" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">Top</button>
        <button class="btn" onclick="window.print()">Print / Export PDF</button>
      </div>
    </div>
  </header>

  <!-- Quick Navigation Pills -->
  <nav class="sub-nav">
    <a href="#er-diagram" class="nav-pill">1. ER Diagram</a>
    <a href="#database-diagram" class="nav-pill">2. Database Schema</a>
    <a href="#usecase-diagram" class="nav-pill">3. Use Case Diagram</a>
    <a href="#class-diagram" class="nav-pill">4. Class Diagram</a>
    <a href="#sequence-diagram" class="nav-pill">5. Sequence Diagram</a>
    <a href="#activity-diagram" class="nav-pill">6. Activity Diagram</a>
    <a href="#deployment-diagram" class="nav-pill">7. Deployment Diagram</a>
  </nav>

  <main class="container">

    <!-- 1. ER Diagram -->
    <section class="diagram-card" id="er-diagram">
      <div class="card-header">
        <div>
          <span class="badge">Entity Relationship</span>
          <h2 class="diagram-title">1. Entity-Relationship (ER) Diagram</h2>
          <p class="diagram-desc">
            Visualizes the data models, cardinalities, and associations between Users, Farms, Crops, IoT Sensors, Disease Diagnostics, Advisory Consultations, and Market Mandi Prices.
          </p>
        </div>
      </div>
      <div class="white-canvas">
        <pre class="mermaid">
erDiagram
    USER ||--o{ FARM : owns
    USER ||--o| EXPERT_PROFILE : extends
    USER ||--o{ DISEASE_REPORT : submits
    USER ||--o{ CONSULTATION : initiates
    USER ||--o{ SOIL_TEST : conducts
    USER ||--o{ HARVEST : records
    USER ||--o{ FARM_EXPENSE : incurs
    USER ||--o{ FARM_TASK : assigned
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ REFRESH_TOKEN : authenticates

    FARM ||--o{ CROP : cultivates
    FARM ||--o{ FARM_PLOT : partitioned_into
    FARM ||--o{ SENSOR : deploys
    FARM ||--o{ FARM_ACTIVITY : logs
    FARM ||--o{ IRRIGATION_LOG : irrigates
    FARM ||--o{ EQUIPMENT : maintains
    FARM ||--o{ INVENTORY_ITEM : stores
    FARM ||--o{ ALERT : triggers

    CROP ||--o{ HARVEST : yields
    CROP ||--o{ SOIL_TEST : sampled_for
    CROP ||--o{ PEST_REPORT : infected_by
    CROP ||--o{ RECOMMENDATION : targeted_by

    SENSOR ||--o{ SENSOR_READING : captures
    EXPERT_PROFILE ||--o{ CONSULTATION : advises
    CONSULTATION ||--o{ CONSULTATION_MESSAGE : contains
    MARKET ||--o{ MARKET_PRICE : quotes

    USER {
        string id PK
        string email UK
        string mobile UK
        string fullName
        string role
        string preferredLang
        string state
        string district
    }
    FARM {
        string id PK
        string ownerId FK
        string name
        string state
        string district
        float areaAcres
        string soilType
        string waterSource
    }
    CROP {
        string id PK
        string farmId FK
        string name
        string stage
        float areaAcres
        string health
    }
    DISEASE_REPORT {
        string id PK
        string farmId FK
        string userId FK
        string imageUrl
        string predictedDisease
        float confidence
        string severity
    }
        </pre>
      </div>
    </section>

    <!-- 2. Database Schema -->
    <section class="diagram-card" id="database-diagram">
      <div class="card-header">
        <div>
          <span class="badge">Relational Schema</span>
          <h2 class="diagram-title">2. Database Physical Schema Diagram</h2>
          <p class="diagram-desc">
            Organized across 4 core functional domains: Security & Identity Management, Spatial & Farm Hierarchy, Crop Telemetry & Operations, and Intelligence & Consultation Engine.
          </p>
        </div>
      </div>
      <div class="white-canvas">
        <pre class="mermaid">
flowchart TD
    subgraph SG_AUTH ["1. Security and Identity Management"]
        T_USER["TABLE: User<br/>-----------------------------------<br/>PK id: String cuid<br/>UQ email: String<br/>UQ mobile: String<br/>passwordHash: String<br/>fullName: String<br/>role: Enum FARMER, EXPERT, ADMIN"]
        T_TOKEN["TABLE: RefreshToken<br/>-----------------------------------<br/>PK id: String cuid<br/>FK userId: String to User.id<br/>UQ token: String<br/>expiresAt: DateTime"]
        T_USER -->|1:N Cascade| T_TOKEN
    end

    subgraph SG_FARM ["2. Spatial and Asset Hierarchy"]
        T_FARM["TABLE: Farm<br/>-----------------------------------<br/>PK id: String cuid<br/>FK ownerId: String to User.id<br/>name: String<br/>state, district, village: String<br/>areaAcres: Float<br/>soilType: String"]
        T_PLOT["TABLE: FarmPlot<br/>-----------------------------------<br/>PK id: String cuid<br/>FK farmId: String to Farm.id<br/>name: String, areaAcres: Float"]
        T_USER -->|1:N Cascade| T_FARM
        T_FARM -->|1:N Cascade| T_PLOT
    end

    subgraph SG_AGRI ["3. Crop Operations and Telemetry"]
        T_CROP["TABLE: Crop<br/>-----------------------------------<br/>PK id: String cuid<br/>FK farmId: String to Farm.id<br/>name, variety: String<br/>stage: Enum PLANTED to HARVESTED"]
        T_SENSOR["TABLE: Sensor<br/>-----------------------------------<br/>PK id: String cuid<br/>FK farmId: String to Farm.id<br/>sensorId: String, type: String"]
        T_READING["TABLE: SensorReading<br/>-----------------------------------<br/>PK id: String cuid<br/>FK sensorId: String to Sensor.id<br/>soilMoisture: Float, temp: Float"]
        T_FARM -->|1:N Cascade| T_CROP
        T_FARM -->|1:N Cascade| T_SENSOR
        T_SENSOR -->|1:N Cascade| T_READING
    end

    subgraph SG_INTEL ["4. Intelligence and Advisory"]
        T_DISEASE["TABLE: DiseaseReport<br/>-----------------------------------<br/>PK id: String cuid<br/>FK farmId: String, FK userId: String<br/>imageUrl, predictedDisease, confidence"]
        T_CONSULT["TABLE: Consultation<br/>-----------------------------------<br/>PK id: String cuid<br/>FK farmerId: String, FK expertId: String<br/>subject, question, status"]
        T_FARM -->|1:N Cascade| T_DISEASE
        T_USER -->|1:N Cascade| T_CONSULT
    end
        </pre>
      </div>
    </section>

    <!-- 3. Use Case Diagram -->
    <section class="diagram-card" id="usecase-diagram">
      <div class="card-header">
        <div>
          <span class="badge">Behavioral Analysis</span>
          <h2 class="diagram-title">3. Use Case Diagram</h2>
          <p class="diagram-desc">
            Defines the role-based system boundaries and behavioral interactions for Farmers, Agronomists, System Administrators, Groq Cloud Vision AI, and Open-Meteo Weather services.
          </p>
        </div>
      </div>
      <div class="white-canvas">
        <pre class="mermaid">
flowchart LR
    Farmer["Farmer"]
    Expert["Agronomist (Expert)"]
    Admin["System Administrator"]
    AI_Service["Groq AI Vision (Llama 3.2)"]
    Weather_Service["Open-Meteo Weather API"]

    subgraph INTELLIFARM ["IntelliFarm Precision Agriculture Platform"]
        UC1(["UC-01: Authenticate and Profile Setup"])
        UC2(["UC-02: Manage Farms, Plots and Crops"])
        UC3(["UC-03: Scan Crop Disease via Photo"])
        UC4(["UC-04: Automated Pathology Inference"])
        UC5(["UC-05: Monitor Weather and 7-Day Forecast"])
        UC6(["UC-06: Calculate Smart Irrigation Schedule"])
        UC7(["UC-07: Search APMC Mandi Market Prices"])
        UC8(["UC-08: Browse and Apply Govt Schemes"])
        UC9(["UC-09: Request Agronomist Consultation"])
        UC10(["UC-10: Review and Prescribe Treatment"])
        UC11(["UC-11: Manage Mandi Feed and Schemes"])
    end

    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC5
    Farmer --> UC6
    Farmer --> UC7
    Farmer --> UC8
    Farmer --> UC9

    UC3 -.->|includes| UC4
    UC4 -.->|executes| AI_Service
    UC5 -.->|fetches| Weather_Service
    UC6 -.->|depends on| UC5
    UC9 -.->|extends| UC10

    Expert --> UC1
    Expert --> UC10

    Admin --> UC1
    Admin --> UC11
        </pre>
      </div>
    </section>

    <!-- 4. Class Diagram -->
    <section class="diagram-card" id="class-diagram">
      <div class="card-header">
        <div>
          <span class="badge">Object-Oriented Design</span>
          <h2 class="diagram-title">4. Class Diagram</h2>
          <p class="diagram-desc">
            Represents the Next.js TypeScript backend domain and service tier, highlighting encapsulation, method contracts, and database interactions.
          </p>
        </div>
      </div>
      <div class="white-canvas">
        <pre class="mermaid">
classDiagram
    class SessionService {
        -String SECRET
        -long ACCESS_TTL
        -long REFRESH_TTL
        +signAccessToken(payload) String
        +signRefreshToken(userId) RefreshToken
        +verifyToken(token) SessionPayload
        +getCurrentUser(cookieStore) User
    }

    class DiseaseService {
        -String GROQ_API_KEY
        -String GROQ_API_URL
        -String VISION_MODEL
        +analyze(imagePath) DiseaseAnalysisResult
        -parseResult(rawResponse) DiseaseAnalysisResult
    }

    class DiseaseAnalysisResult {
        +String cropName
        +String predictedDisease
        +double confidence
        +String severity
        +String symptoms
        +String recommendedAction
        +String preventionTips
    }

    class WeatherService {
        -String BASE_URL
        +getForecast(latitude, longitude) WeatherForecastResponse
        -wmoToCondition(code) WeatherCondition
        -buildInsights(forecast) List_Insight
    }

    class IrrigationEngine {
        +calculateWaterRequirement(crop, reading, forecast) IrrigationRecommendation
        +checkRainfallThreshold(rainProb) boolean
        +logIrrigationEvent(farmId, litres, durationMin) IrrigationLog
    }

    class MarketPriceService {
        +getMarketPrices(crop, marketId, days) List_MarketPrice
        +getTeluguCropAlias(searchTerm) String
        +getRecentTrend(cropName) TrendAnalysis
    }

    DiseaseService ..> DiseaseAnalysisResult : creates
    IrrigationEngine ..> WeatherService : queries rain prob
        </pre>
      </div>
    </section>

    <!-- 5. Sequence Diagram -->
    <section class="diagram-card" id="sequence-diagram">
      <div class="card-header">
        <div>
          <span class="badge">Dynamic Execution</span>
          <h2 class="diagram-title">5. Sequence Diagram: AI Disease Diagnosis & Expert Consultation</h2>
          <p class="diagram-desc">
            Chronological step-by-step trace showing photo upload, Groq Vision multi-modal inference, automated database persistence, and optional agronomist ticket escalation.
          </p>
        </div>
      </div>
      <div class="white-canvas">
        <pre class="mermaid">
sequenceDiagram
    autonumber
    actor F as Farmer
    participant UI as Next.js Client
    participant API as Route Handler (/api/v1/disease)
    participant FS as Storage
    participant DB as PostgreSQL (Supabase)
    participant Groq as Groq Vision API
    actor E as Agronomist

    F->>UI: 1. Upload photo of diseased crop
    UI->>API: 2. POST /api/v1/upload (image file)
    API->>FS: 3. Store image asset
    FS-->>API: 4. Image URL confirmed
    API-->>UI: 5. Upload success

    UI->>API: 6. POST /api/v1/disease/analyze (farmId, imageUrl)
    API->>FS: 7. Read image bytes and encode to base64
    FS-->>API: 8. Return base64 data URI
    
    API->>Groq: 9. POST /v1/chat/completions (llama-3.2-11b-vision)
    Note over Groq: Evaluates foliar lesions and pathogens
    Groq-->>API: 10. Return JSON: disease, confidence 0.92, severity HIGH
    
    API->>DB: 11. INSERT INTO DiseaseReport
    API->>DB: 12. INSERT INTO FarmActivity
    DB-->>API: 13. Commits successful
    API-->>UI: 14. 200 OK with diagnosis and remedy
    UI-->>F: 15. Render diagnosis card and treatment advice

    opt Escalation to Agronomist
        F->>UI: 16. Click Request Agronomist Opinion
        UI->>API: 17. POST /api/v1/expert/consultations
        API->>DB: 18. INSERT INTO Consultation (status OPEN)
        API-->>E: 19. Alert: New High Severity Case
        E->>UI: 20. Agronomist reviews and prescribes remedy
        UI->>API: 21. POST /api/v1/expert/consultations/:id/messages
        API->>DB: 22. Update status to ANSWERED
        API-->>F: 23. Notification: Agronomist prescription ready
    end
        </pre>
      </div>
    </section>

    <!-- 6. Activity Diagram -->
    <section class="diagram-card" id="activity-diagram">
      <div class="card-header">
        <div>
          <span class="badge">Workflow Algorithm</span>
          <h2 class="diagram-title">6. Activity Diagram: Smart Irrigation Decision Logic</h2>
          <p class="diagram-desc">
            Algorithmic control flow modeling IoT soil moisture verification, rain forecast gating (>= 60%), ambient heat compensation, and irrigation scheduling.
          </p>
        </div>
      </div>
      <div class="white-canvas">
        <pre class="mermaid">
flowchart TD
    START([Start: Scheduled Irrigation Cycle]) --> FETCH_TELEMETRY["Acquire Soil Moisture and Temperature<br/>(IoT Telemetry or Manual Log)"]
    
    FETCH_TELEMETRY --> FETCH_WEATHER["Fetch 7-Day Local Weather Forecast<br/>from Open-Meteo API"]
    
    FETCH_WEATHER --> CHECK_RAIN{"Is Rain Probability >= 60%<br/>in the next 24 Hours?"}
    
    CHECK_RAIN -- Yes --> LOG_SKIP["Log Decision: SKIPPED (Rain Expected)"]
    LOG_SKIP --> ALERT_RAIN["Dispatch Alert: Rain Expected. Save Water"]
    ALERT_RAIN --> END_STATE([End Cycle])

    CHECK_RAIN -- No --> CHECK_MOISTURE{"Is Soil Moisture < Threshold?<br/>(e.g., < 35% for Tomato)"}
    
    CHECK_MOISTURE -- No: Moisture Adequate --> LOG_OPTIMAL["Log State: MOISTURE_OPTIMAL"]
    LOG_OPTIMAL --> END_STATE

    CHECK_MOISTURE -- Yes: Dry Soil --> CALC_BASE["Calculate Base Water Requirement<br/>(Acres x 500 Litres)"]
    
    CALC_BASE --> CHECK_HEAT{"Is Ambient Temp >= 32C?"}
    
    CHECK_HEAT -- Yes --> ADD_HEAT["Scale Volume by +20%<br/>(Evapotranspiration Offset)"]
    CHECK_HEAT -- No --> COMPOSE_PLAN["Schedule Drip Irrigation:<br/>Early Morning 06:00 or Evening 18:00"]
    
    ADD_HEAT --> COMPOSE_PLAN
    COMPOSE_PLAN --> RECORD_LOG["Persist Record in Database:<br/>IrrigationLog and Recommendation"]
    RECORD_LOG --> NOTIFY_FARMER["Deliver Notification to Farmer"]
    NOTIFY_FARMER --> END_STATE
        </pre>
      </div>
    </section>

    <!-- 7. Deployment Diagram -->
    <section class="diagram-card" id="deployment-diagram">
      <div class="card-header">
        <div>
          <span class="badge">Infrastructure Topology</span>
          <h2 class="diagram-title">7. Deployment Diagram: Cloud & Micro-Service Architecture</h2>
          <p class="diagram-desc">
            Physical deployment map connecting Client Devices, Vercel Serverless Edge, Supabase Managed PostgreSQL (AWS ap-south-1), Groq AI Cloud, Open-Meteo Meteorology, and optional Spring Boot backend.
          </p>
        </div>
      </div>
      <div class="white-canvas">
        <pre class="mermaid">
flowchart TD
    subgraph CLIENT_TIER ["Client Tier (End-User Devices)"]
        BROWSER["Web Browser / Mobile PWA<br/>Chrome, Safari, Edge<br/>- Next.js Client Bundle<br/>- Zustand State Store<br/>- TanStack Query Cache<br/>- Tailwind UI"]
    end

    subgraph CLOUD_EDGE ["Application and Compute Tier (Vercel Edge)"]
        EDGE_ROUTER["Vercel Global Edge CDN<br/>- TLS 1.3 Termination<br/>- DDoS and WAF Protection<br/>- Static Asset Caching"]
        SERVERLESS_API["Next.js 15 Serverless Engine<br/>- /api/v1/auth/* (Stateless Auth)<br/>- /api/v1/weather/* (Microclimate)<br/>- /api/v1/disease/* (Vision Diagnostics)<br/>- /api/v1/market-prices/* (Mandi Engine)<br/>- Prisma Client ORM Layer"]
        EDGE_ROUTER --> SERVERLESS_API
    end

    subgraph DATABASE_TIER ["Database Tier (Supabase Cloud AWS ap-south-1)"]
        PGBOUNCER["PgBouncer Connection Pooler<br/>Port: 6543 (Transaction Mode)"]
        POSTGRES["PostgreSQL 15 Managed Cluster<br/>- 23 Normalized Relational Tables<br/>- Automated Backups and PITR<br/>- Cascading Foreign Keys"]
        PGBOUNCER --> POSTGRES
    end

    subgraph EXTERNAL_SERVICES ["External Cloud Services"]
        GROQ_AI["Groq Cloud AI (LPU Acceleration)<br/>- Model: llama-3.2-11b-vision-preview<br/>- Multi-modal Plant Pathology"]
        WEATHER_API["Open-Meteo Meteorology Service<br/>- Real-time and 7-Day Forecast<br/>- WMO Code Mapping"]
    end

    subgraph LOCAL_ENTERPRISE ["Hybrid Service (Optional Local Spring Boot)"]
        SPRING_BOOT["Spring Boot 3.3.2 Backend<br/>- Embedded Tomcat (Port 8080)<br/>- Spring Data JPA and Hibernate"]
    end

    BROWSER -->|"HTTPS (Port 443)"| EDGE_ROUTER
    SERVERLESS_API -->|"Secure TCP (Port 6543)"| PGBOUNCER
    SERVERLESS_API -->|"HTTPS REST (Bearer Token)"| GROQ_AI
    SERVERLESS_API -->|"HTTPS REST"| WEATHER_API
    SPRING_BOOT -.->|"JDBC Connection"| POSTGRES
        </pre>
      </div>
    </section>

  </main>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        background: '#ffffff',
        primaryColor: '#eff6ff',
        primaryBorderColor: '#2563eb',
        primaryTextColor: '#0f172a',
        lineColor: '#2563eb',
        secondaryColor: '#f8fafc',
        tertiaryColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'diagrams.html'), htmlContent, 'utf8');
console.log('diagrams.html generated successfully with UTF-8 encoding!');
