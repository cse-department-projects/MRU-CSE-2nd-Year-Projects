# City Watch

Medium-level full-stack emergency reporting and authority response system.

## Stack

- Java 17 + Spring Boot
- Spring Data JPA / Hibernate
- Spring Security + JWT + BCrypt
- MySQL
- React + Vite
- Web Speech API

## Core flow

Citizen logs in -> reports emergency -> department is assigned automatically -> authority receives alert -> Acknowledge -> On the Way -> Resolved -> citizen sees updates.

## 1. Create the MySQL database

Open MySQL Workbench or MySQL Shell and run:

```sql
CREATE DATABASE citywatch;
```

You do not need to create the tables manually. Hibernate will create/update them from the JPA entities.

## 2. Configure the backend

The default connection is:

- URL: jdbc:mysql://localhost:3306/citywatch
- Username: root
- Password: empty

If your MySQL password is not empty, set an environment variable before starting the backend:

PowerShell:

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
```

For a more permanent setup, edit `backend/src/main/resources/application.properties`.

## 3. Start backend

From the `backend` folder:

```powershell
.\mvnw.cmd spring-boot:run
```

If Maven Wrapper is not available, use:

```powershell
mvn spring-boot:run
```

Backend:
http://localhost:8080

Health check:
http://localhost:8080/api/health

## 4. Start frontend

Open another terminal in `frontend`:

```powershell
npm install
npm run dev
```

Frontend:
http://localhost:5173

## 5. Seeded authority accounts

The backend creates four department authority accounts automatically on first startup.

| Department | Email | Password |
|---|---|---|
| Fire | fire@citywatch.local | Fire@123 |
| Medical | medical@citywatch.local | Medical@123 |
| Crime | crime@citywatch.local | Crime@123 |
| Accident | accident@citywatch.local | Accident@123 |

These are development/demo credentials. Change them before any real deployment.

## 6. Citizen

Use **Register** to create a citizen account. After login, the citizen's identity is automatically attached to reports. The report form never asks for a Citizen ID.

## 7. Speech recognition

The report form uses the browser Web Speech API. Chrome/Edge are recommended. The browser will ask for microphone permission the first time the microphone is used.

## Notes

This is intentionally a medium-level project: real authentication, REST APIs, relational database, department authorization, notifications, status workflow, polling, and speech input without adding unnecessary AI or enterprise infrastructure.
