# Auction Platform (EECS-4413)

## 🧾 Project Overview
This project is a **real-time online auction platform** developed as part of the EECS 4413 course.  
It allows users to register, browse items, place bids, and make mock payments through a secure and modular web application.  

The main goal of the system is to demonstrate a **clean, layered architecture** using **Spring Boot** and modern web technologies.  
It emphasizes maintainability, scalability, and adherence to software engineering best practices such as separation of concerns, modularization, and design pattern use.

---

## 🧱 Tech Stack

### **Backend**
- **Java 17** — primary programming language  
- **Spring Boot 3.x** — main application framework  
- **Spring Web / MVC** — handles REST APIs and routing  
- **Spring Data JPA (Hibernate)** — object-relational mapping (ORM) for database access  
- **Spring Security (JWT-based)** — authentication and authorization  
- **PostgreSQL** — main relational database
- **Flyway** — For database create and seed data
- **Jakarta Validation** — input validation across controllers and DTOs  

### **Frontend (for D3)**
- **React + TypeScript** — user interface framework  
- **Vite** — fast development build tool  
- **Tailwind CSS** — component styling  
- **React Query** — state management and data synchronization  
- **SSE (Server-Sent Events)** — real-time updates for live bidding  

### **DevOps / Tooling**
- **Maven** — build automation and dependency management  
- **Docker & Docker Compose** — containerized services and local environment setup  
- **JUnit 5 / Mockito** — unit and integration testing  

---

## 🧩 Architecture Overview

The system follows a **multi-module, microservice-ready architecture**, designed around clear separation of responsibilities:


---

## ⚙️ Architectural Layers (per Service)

Each service (user, catalogue, auction, payment) follows the **Spring layered architecture pattern**:

1. **Controller Layer** – handles incoming REST requests and responses.  
   - Uses DTOs (Data Transfer Objects) to communicate with clients.  
   - Validates input using Jakarta Bean Validation.

2. **Service Layer** – contains **business logic** and orchestrates repository operations.  
   - Enforces rules like “bids must be strictly increasing” and “only logged-in users can bid”.

3. **Repository Layer** – uses **Spring Data JPA** for database persistence.  
   - Encapsulates all SQL logic and entity management.

4. **Entity / Model Layer** – maps database tables to Java objects (JPA entities).  
   - Each entity includes validation constraints and relationships (e.g., OneToMany).

---

## 🧠 Design Patterns Used

- **Model–View–Controller (MVC):**  
  Used within each Spring Boot service to separate web requests (Controller), business logic (Service), and persistence (Repository).

- **Repository Pattern:**  
  Encapsulates data access logic, promoting abstraction and easier testing.

- **DTO (Data Transfer Object) Pattern:**  
  Prevents entity exposure in APIs and defines consistent data contracts between layers and services.

- **Dependency Injection (DI):**  
  Managed automatically by Spring for modular, testable code.

- **Observer Pattern (via SSE):**  
  Used in the Auction Service to notify clients in real time when new bids are placed.

- **Singleton Pattern:**  
  Applied implicitly through Spring-managed beans (e.g., services and repositories).

---

## 🏗️ Overall Design Philosophy

- **Separation of Concerns:** Each microservice handles a single bounded context.  
- **Scalability:** Independent services allow horizontal scaling if required.  
- **Resilience:** API and service layers remain loosely coupled.  
- **Testability:** Use of MockMvc, JUnit, Mockito, and clean layering enables automated testing.  
- **Extensibility:** Ready for D3 integration with React UI and optional real-time WebSocket communication.  

---

## 🧾 Summary

| Layer / Module       | Responsibility                                  | Tech Used                  |
|----------------------|--------------------------------------------------|-----------------------------|
| **User Service**     | Auth, signup, login, profiles, JWT               | Spring Boot, JPA, BCrypt    |
| **Catalogue Service**| Item listings, search, metadata                 | Spring Boot, JPA, PostgreSQL|
| **Auction Service**  | Bids, timers, SSE stream                        | Spring Boot, JPA            |
| **Payment Service**  | Mock payments, receipt generation               | Spring Boot, Validation     |
| **Frontend (D3)**    | User UI for browsing and bidding                | React, TypeScript, Tailwind |

---

## 🧭 In Summary
The Auction Platform demonstrates how a distributed, layered, and pattern-driven architecture can be implemented using **Spring Boot** while maintaining clarity, modularity, and extendability. It provides a clean foundation for both academic demonstration and scalable production systems.

---

## 🧪 Local Setup & End-to-End Smoke Test

1. **Install prerequisites**
  - Java 17 (LTS). Verify with `java -version` and ensure the runtime reports 17.x.
  - PostgreSQL 14+ with the `psql` CLI on your PATH (`psql --version`).
  - (Optional) Node.js if you plan to run the React frontend.

2. **Import the Maven project**
   - Clone or unzip the repository.
   - Open `auction-platform/pom.xml` in your IDE (Eclipse or IntelliJ) using “Import existing Maven project” so the wrapper (`mvnw`) downloads dependencies.

3. **Configure PostgreSQL**
   - Create the application database:
     ```powershell
     psql -U postgres -c "CREATE DATABASE auction;"
     ```
   - Apply schema and seed data using the provided scripts:
     ```powershell
     psql -d auction -f scripts/create_schema.sql
     psql -d auction -f scripts/seed_sample_data.sql
     ```

4. **Set environment variables**
   - Create an `.env` file beside `auction-platform/pom.xml` (or configure OS-level variables) with:
     - `DB_URL` (default `jdbc:postgresql://localhost:5432/auction`)
     - `DB_USERNAME`
     - `DB_PASSWORD`
     - `JWT_SECRET_KEY` and `FORGOT_PASSWORD_SECRET` (Base64-encoded secrets)

5. **Build and run automated tests**
   ```powershell
   cd auction-platform
   ./mvnw.cmd clean test
   ```
   - Confirms the project compiles and unit tests pass.

6. **Start the Spring Boot application**
   - Package a runnable JAR: `./mvnw.cmd clean package`
   - Run from the packaged artifact: `java -jar target/auction-platform-0.0.1-SNAPSHOT.jar`
   - Or run directly for development: `./mvnw.cmd spring-boot:run`
   - Wait for `Started AuctionPlatformApplication` before calling REST endpoints on `http://localhost:8080`.

Stop the server with `Ctrl+C` when finished. Re-run the schema scripts whenever your local database drifts from the expected structure.

---
## 🔍 Automated Tests

- **How to run**: execute `./mvnw.cmd clean test` from `auction-platform/` to rebuild the backend and run all unit tests.
- **AuctionServiceTest** (`src/test/java/com/eecs4413/auction_platform/service/AuctionServiceTest.java`): covers auction search filters, detail lookups, and that a winning bid updates prices and emits WebSocket payloads.
- **PaymentServiceTest** (`src/test/java/com/eecs4413/auction_platform/service/PaymentServiceTest.java`): validates payment summaries, enforces price calculations, and checks guarded failure paths for invalid receipts.
- **UserServiceTest** (`src/test/java/com/eecs4413/auction_platform/service/UserServiceTest.java`): exercises registration, duplicate email rejection, login token issuance, and logout token revocation workflows.
- **PasswordResetServiceTest** (`src/test/java/com/eecs4413/auction_platform/service/PasswordResetServiceTest.java`): verifies forgot-password requests, reset token lifecycle, and password updates with attempt limits.
- **Troubleshooting**: if a context load fails due to schema drift, reapply `scripts/create_schema.sql` and `scripts/seed_sample_data.sql` so Hibernate’s validation aligns with the expected columns (e.g., `payments.paymentid`).

---
