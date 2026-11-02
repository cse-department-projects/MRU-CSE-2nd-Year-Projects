# LogiLink - System Documentation

## 1. Introduction

LogiLink is a Transportation and Logistics Management System developed to manage logistics operations through a centralized web application.

## 2. System Architecture

The application follows a frontend-backend architecture.

- Frontend: React with Vite
- Backend: Java with Spring Boot
- Database: MySQL
- Communication: REST APIs
- Authentication: Spring Security and JWT

## 3. Functional Modules

### Dashboard
Provides an overview of logistics operations and key performance indicators.

### Order Management
Supports creating, viewing and managing logistics orders.

### Shipment Management
Manages shipment information and delivery progress.

### Fleet and Vehicle Management
Supports vehicle registration, updates, status management and fleet monitoring.

### Driver Management
Maintains driver information and assignments.

### Route Management
Manages transportation routes and route information.

### Live Tracking
Displays shipment and vehicle tracking information using persisted tracking events.

### Warehouse Management
Maintains warehouse information and related operations.

### Inventory Management
Manages inventory items and stock information.

### Analytics and Reports
Provides operational insights and reporting.

### Notifications
Displays relevant system notifications.

### Activity Logs
Maintains records of relevant system activities.

### Authentication and Organization Management
Supports user authentication, roles and organization-based data management.

## 4. Security

The backend uses Spring Security and JWT-based authentication. Database credentials and signing secrets must be configured through environment variables and must not be committed to version control.

## 5. Data Management

The application uses MySQL with Spring Data JPA and Hibernate. Organization-based data separation is implemented in the backend.

## 6. Current Tracking Implementation

Live Tracking uses persisted simulated tracking events. It does not currently require a physical GPS device or external GPS provider.

## 7. Development Environment

- Java 21+
- Maven 3.9+
- Node.js and npm
- MySQL Server
- React and Vite

## 8. Execution

Refer to the main README.md and DATABASE-SETUP.md for installation, database configuration and execution instructions.
