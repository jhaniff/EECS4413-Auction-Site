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

2. **Download the distribution**
  - Obtain the published Spring Boot JAR (for example `auction-platform-0.0.1-SNAPSHOT.jar`) from the release bundle or secure file share.

3. **Configure the database**
   - Create a local database (names are suggestions):
     ```powershell
     psql -U postgres -c "CREATE DATABASE auction;"
     ```
   - Load schema and sample data (recommended for demo accounts/items):
     ```powershell
     psql -d auction -f scripts/create_schema.sql
     psql -d auction -f scripts/seed_sample_data.sql
     ```
   - Confirm tables exist with `psql -d auction -c "\dt"`.

4. **Provide application secrets**
   - Create a `.env` file in the same directory as the JAR.
   - Populate values: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET_KEY`, and `FORGOT_PASSWORD_SECRET` (64-byte Base64 strings).

5. **(Optional) Build & test from source**
   - If you have source access and want to verify the build, run `.\mvnw.cmd clean test` before packaging the JAR.

6. **Start Spring Boot from the JAR**
  ```powershell
  java -jar .\auction-platform-0.0.1-SNAPSHOT.jar
  ```
  - Wait for the console to log `Started AuctionPlatformApplication` before issuing API requests.

7. **Register or reuse a seller account**
   - With seed data, update the password hash or create a new account:
     ```powershell
     curl.exe -X POST http://localhost:8080/register `
       -H "Content-Type: application/json" `
       -d @'
     {
       "email": "dev.seller@example.com",
       "password": "Password123",
       "confirmPassword": "Password123",
       "firstName": "Dev",
       "lastName": "Seller",
       "userAddress": {
         "streetName": "Main St",
         "streetNumber": "100",
         "city": "Toronto",
         "country": "Canada",
         "postalCode": "M1M1M1"
       }
     }
     '@
     ```
   - Store the `accessToken` from the response or sign in later to refresh it.

8. **Authenticate to get a JWT**
   ```powershell
   curl.exe -X POST http://localhost:8080/login `
     -H "Content-Type: application/json" `
     -d @'
   {"email":"dev.seller@example.com","password":"Password123"}
   '@
   ```
   Copy the `accessToken` for subsequent requests.

9. **Exercise the seller item-creation endpoint**
   ```powershell
   curl.exe -X POST http://localhost:8080/api/items `
     -H "Content-Type: application/json" `
     -H "Authorization: Bearer <PASTE_TOKEN_HERE>" `
     -d @'
   {
     "name": "Demo Camera",
     "description": "4K mirrorless body with two lenses",
     "type": "Forward",
     "shippingDays": 3,
     "baseShipCost": 12.50,
     "expeditedCost": 29.99,
     "keywords": ["camera", "photography"]
   }
   '@
   ```
   - Expect HTTP 201, a `Location` header, and the created item payload.
   - Re-run with missing/invalid fields to observe `400 Bad Request` validation responses.
   - Call the same endpoint without the `Authorization` header to confirm a `401` response.

10. **Shutdown and cleanup**
    - Stop Spring Boot with `Ctrl+C`.
    - If you are working from source, re-run `.\mvnw.cmd clean test` before committing changes.
    - If using the frontend, follow `frontend/README.md` after the backend is healthy.

These steps give a reliable path from a fresh download to exercising secured endpoints end-to-end.

---
