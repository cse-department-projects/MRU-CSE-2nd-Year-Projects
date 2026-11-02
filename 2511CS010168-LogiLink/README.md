# LogiLink - Transportation & Logistics Management System

## Project Overview

LogiLink is a web-based Transportation and Logistics Management System designed to simplify and manage logistics operations through a centralized platform.

The system provides tools for managing orders, shipments, vehicles, drivers, routes, warehouses, inventory, tracking, and operational analytics.

## Technology Stack

### Frontend

* React 19
* Vite
* JavaScript
* React Router
* Lucide React
* Leaflet

### Backend

* Java 21+
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Security
* JWT Authentication
* Maven

### Database

* MySQL

## Main Modules

1. Dashboard
2. Order Management
3. Shipment Management
4. Fleet and Vehicle Management
5. Driver Management
6. Route Management
7. Live Tracking
8. Warehouse Management
9. Inventory Management
10. Analytics and Reports
11. Notifications
12. Activity Logs
13. User Authentication and Organization Management

## Project Structure

```text
2511CS010168-LogiLink/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── pom.xml
│   └── README.md
├── documentation/
│   ├── DATABASE-SETUP.md
│   └── SYSTEM-DOCUMENTATION.md
└── .gitignore
```

## Prerequisites

* JDK 21 or later
* Apache Maven 3.9+
* Node.js and npm
* MySQL Server
* Git

## Running the Application

### 1. Clone the repository

```bash
git clone <repository-url>
cd 2511CS010168-LogiLink
```

### 2. Configure MySQL

Create a dedicated database:

```sql
CREATE DATABASE logilink_demo;
```

Configure the backend database connection using environment variables. Refer to `documentation/DATABASE-SETUP.md`.

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

API URL: `http://localhost:8080/api`

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Configuration

The backend supports environment-based configuration for database credentials, JWT secrets, CORS origins, and demo data seeding.

The frontend supports the `VITE_API_BASE_URL` environment variable.

Default API endpoint: `http://localhost:8080/api`

Never commit passwords, private keys, JWT secrets, or environment files.

## Demo Data

When enabled and the users table is empty, the backend data seeder inserts sample organizations, users, vehicles, drivers, orders, shipments, and related records.

Demo credentials are documented in `backend/README.md`.

## API Documentation

When the backend is running:

* `/api/docs`
* `/api/swagger-ui`

## Testing

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

## Important Notes

* MySQL and the backend must be running for the complete application to work.
* GitHub stores the source code; it does not automatically host the complete application.
* Live Tracking currently uses persisted simulated tracking events rather than a physical GPS provider.
* Hibernate manages database schema updates.

## Project Information

**Project:** LogiLink

**Category:** Transportation & Logistics Management System

**Frontend:** React + Vite

**Backend:** Java + Spring Boot

**Database:** MySQL
