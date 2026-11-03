# 🏥 Hospital Management System (HMS)

> **Batch:** Batch 30 - CSE BETA  
> **Course:** 2nd Year Computer Science & Engineering Projects  
> **Institution:** Malla Reddy University (MRU)

---

## 📌 Project Overview

**Hospital Management System (HMS)** is a full-stack enterprise web application engineered to automate and streamline hospital operations across four distinct user roles: **Admin**, **Doctor**, **Patient**, and **Pharmacist**.

The platform provides end-to-end clinical workflow automation, including online appointment scheduling, electronic medical records (EMR), digital prescription generation, pharmacy medicine inventory management, and automated patient billing.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons
- **Backend:** Java 21, Spring Boot 3.2, Spring Security (JWT Authentication & RBAC), Spring Data JPA / Hibernate
- **Database:** MySQL 8.0+
- **Notifications:** Gmail SMTP Service (automated email notifications for appointments)
- **API Documentation:** OpenAPI 3.0 / Swagger UI

---

## 🌟 Key Features

1. **Multi-Role Authentication & Access Control:**
   - Secure role-based access for Admin, Doctor, Patient, and Pharmacist using JWT bearer tokens and BCrypt password encryption.

2. **Admin Portal:**
   - Onboard & manage doctors, staff, and patient accounts.
   - Comprehensive system audit logs, hospital performance charts, and revenue statistics.

3. **Doctor Portal:**
   - Real-time appointment schedule and patient consultation queue.
   - Record diagnosis notes, medical history, and issue digital prescriptions.

4. **Patient Portal:**
   - Search doctors by specialization and book appointment slots.
   - Access consultation history, active prescriptions, and medical billing receipts.
   - Real-time automated email confirmations.

5. **Pharmacy & Inventory Portal:**
   - Real-time medicine stock catalog tracking.
   - Batch number, expiry date tracking, and low-stock alerts.
   - Direct dispensing based on doctor electronic prescriptions.

6. **Billing & Invoicing:**
   - Automated itemized invoice generation combining doctor consultation fees and pharmacy medicines.

---

## 🏗️ System Architecture & Data Flow

- **System Architecture:** Clean 3-Tier architecture (Presentation Layer · Spring Boot Application Layer · MySQL Database)
- **Data Flow Diagram:** End-to-end module workflow representation

*(Refer to `system_architecture.png` and `data_flow_diagram.png` included in this folder)*

---

## 🚀 How to Run the Project

### Prerequisites
- **Java JDK 21+**
- **Node.js 18+** & npm
- **MySQL 8.0+** running on port `3306`

### 1. Database Configuration
Create a database named `hms_db` or ensure MySQL credentials in `hms-backend/src/main/resources/application.properties` are configured:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hms_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password
```

### 2. Run Backend (Spring Boot)
```bash
cd hms-backend
./mvnw spring-boot:run
```
*Backend starts on `http://localhost:8080/api`*

### 3. Run Frontend (React + Vite)
```bash
cd hms-frontend
npm install
npm run dev
```
*Frontend starts on `http://localhost:5173`*

---

## 🔐 Default Seeded Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@hms.com` | `Admin@123` |
| **Doctor** | `gbhavana797@gmail.com` | `Doctor@123` |
| **Patient** | `jvedavanshika@gmail.com` | `Patient@123` |
| **Pharmacist** | `pharmacist@hms.com` | `Pharmacist@123` |

---

## 📖 API Documentation
After starting the backend, interactive Swagger UI documentation is accessible at:
- **Swagger UI:** `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/api/v3/api-docs`
