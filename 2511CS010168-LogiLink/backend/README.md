# LogiLink Backend

Spring Boot REST API for the LogiLink Transportation and Logistics Management frontend.

## Stack

- Java 21+
- Spring Boot
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security
- JWT authentication
- MySQL
- Maven

## Environment

The backend reads configuration from environment variables.

```bash
DB_URL=jdbc:mysql://localhost:3306/logilink?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace-with-a-strong-256-bit-secret
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SEED_ENABLED=true
```

## Demo Accounts

Seed data is inserted only when the `users` table is empty.

```text
admin@logilink.edu / LogiLink@123
manager@logilink.edu / LogiLink@123
operator@logilink.edu / LogiLink@123
```

## Run

Start MySQL, then run:

```bash
cd backend
mvn spring-boot:run
```

In another terminal:

```bash
npm install
npm run dev
```

The React frontend calls `http://localhost:8080/api` by default. Override with:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## API Docs

When the backend is running:

- OpenAPI JSON: `http://localhost:8080/api/docs`
- Swagger UI: `http://localhost:8080/api/swagger-ui`

## Notes

- The Live Tracking API uses persisted simulated tracking events because no physical GPS provider is configured yet.
- Dashboard and analytics endpoints calculate values from database records instead of returning hard-coded JSON.
- Runtime database schema is managed by Hibernate `ddl-auto=update` for development.
