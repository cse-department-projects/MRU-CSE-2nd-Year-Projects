# 🛡️ ResQNet — Disaster Emergency Coordination Platform

ResQNet is a full-stack disaster response and citizen safety management platform engineered to connect Citizens, Volunteers, Rescue Teams, and Administrators in real-time.

---

## 🏗️ Monorepo Structure

```
resqnet/
├── backend/                  # Java 21/26 + Spring Boot 3.3.4 + Maven
│   ├── pom.xml               # Dependencies (Web, Security, Data JPA, WebSocket, JWT, MySQL)
│   ├── src/main/java/        # Clean Layered Architecture
│   └── src/main/resources/   # application.properties (ResQUnit_DB_Final)
│
├── frontend/                 # React 19 + TypeScript + Vite
│   ├── src/                  # Components, Context, Hooks, Pages, Services, Styles, Types
│   ├── .env & .env.example   # Configurable API & WebSocket URLs
│   └── package.json          # React, Lucide Icons, Leaflet, Axios, React Router
└── README.md
```

---

## 🚀 Running the Project Locally

### 1. Backend (Spring Boot)
```bash
cd backend
# Build the project
mvn clean compile

# Run the backend application
mvn spring-boot:run
```
Backend API will start at `http://localhost:8080`.

### 2. Frontend (React + Vite)
```bash
cd frontend
# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
Frontend Web App will start at `http://localhost:5173`.
