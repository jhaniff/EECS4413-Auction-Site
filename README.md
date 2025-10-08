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
- **Spring Cloud Gateway** — acts as the entry point for all services (API gateway)  
- **Flyway** — database versioning and migration  
- **PostgreSQL** — main relational database  
- **Redis (optional)** — caching and distributed locking for auction concurrency  
- **Actuator + Micrometer** — monitoring and health checks  

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
- **GitHub Actions** — continuous integration (CI)  
- **Testcontainers** — real Postgres/Redis testing environments  

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

- **Gateway Pattern:**  
  Implemented via Spring Cloud Gateway to centralize authentication, routing, and API composition.

- **Observer Pattern (via SSE):**  
  Used in the Auction Service to notify clients in real time when new bids are placed.

- **Singleton Pattern:**  
  Applied implicitly through Spring-managed beans (e.g., services and repositories).

---

## 🏗️ Overall Design Philosophy

- **Separation of Concerns:** Each microservice handles a single bounded context.  
- **Scalability:** Independent services allow horizontal scaling if required.  
- **Resilience:** Gateway and service layers are loosely coupled.  
- **Testability:** Use of Testcontainers, MockMvc, and clean layering enables robust automated testing.  
- **Extensibility:** Ready for D3 integration with React UI and optional real-time WebSocket communication.  

---

## 🧾 Summary

| Layer / Module       | Responsibility                                  | Tech Used                  |
|----------------------|--------------------------------------------------|-----------------------------|
| **Gateway**          | Central routing, authentication, CORS, API docs | Spring Cloud Gateway        |
| **User Service**     | Auth, signup, login, profiles, JWT               | Spring Boot, JPA, BCrypt    |
| **Catalogue Service**| Item listings, search, metadata                 | Spring Boot, JPA, PostgreSQL|
| **Auction Service**  | Bids, timers, concurrency, SSE stream           | Spring Boot, Redis, Flyway  |
| **Payment Service**  | Mock payments, receipt generation               | Spring Boot, Validation     |
| **Frontend (D3)**    | User UI for browsing and bidding                | React, TypeScript, Tailwind |

---

## 🧭 In Summary
The Auction Platform demonstrates how a distributed, layered, and pattern-driven architecture can be implemented using **Spring Boot** while maintaining clarity, modularity, and extendability. It provides a clean foundation for both academic demonstration and scalable production systems.
