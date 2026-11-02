# LogiLink - Database Setup

## Database Technology
LogiLink uses MySQL for persistent data storage.

## Prerequisites
- MySQL Server installed and running.
- A MySQL user with permission to create and access databases.

## 1. Create a Dedicated Database

Execute this SQL command in MySQL:

CREATE DATABASE logilink_demo;

## 2. Configure Backend Connection

Set these environment variables in PowerShell before starting the backend:

DB_URL=jdbc:mysql://localhost:3306/logilink_demo
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

Replace the password locally. Never upload actual credentials to GitHub.

## 3. Database Schema

The application uses Spring Data JPA and Hibernate to create or update database tables when the backend starts.

## 4. Demo Data

When demo seeding is enabled and the users table is empty, sample organizations, users, vehicles, drivers, orders, shipments and other records are inserted.

## 5. Important Notes

- Use a dedicated database for demonstration.
- Never upload database passwords or JWT secrets.
- Do not use another person's production database.
- TenantMigrationRunner may assign records without an organization to the DEMO organization.
- Use a fresh database for the first demonstration.

## 6. Start the Backend

Run:

cd backend
mvn spring-boot:run
