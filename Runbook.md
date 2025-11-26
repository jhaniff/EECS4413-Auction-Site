# EECS 4413 Auction Platform – Runbook (Microservices Deployment)

_Last updated: 2025-11-22_  
_Owners: Joshua Hanif, Farah Madkour, George Yousif, Sandeepon Saha, Matthew Patrus_

---

## 1. Overview

### 1.1 Purpose

This runbook describes how to deploy, start, stop, monitor, and troubleshoot the **Auction Platform** in its **microservice** deployment. It is intended for developers, TAs, and operators who need to:

- Bring the system up from scratch (e.g., on a new machine or VM).  
- Verify that all microservices are healthy.  
- Diagnose and resolve common runtime issues.

### 1.2 System Description

The Auction Platform is a web-based system that allows users to:

- Register and sign in.  
- Browse a catalogue of items.  
- Place bids in online auctions.  
- Pay for won auctions.  
- Arrange shipping for purchased items.

The system is composed of the following components:

- **API Gateway / Web Frontend** – single entry point for browsers; routes API calls to backend services and serves the UI.
- **User Service** – user registration, login, authentication, 2FA.  
- **Auction Service** – auctions, bids, auction statuses, winners.  
- **Catalogue Service** – item metadata and keyword-based search.  
- **Payment Service** – payment summary and payment processing.  
- **Shipping Service** – shipping estimates and shipment records.  
- **Per-service databases** – one database per microservice.

All services communicate via HTTP/REST. Each service persists its own data in a dedicated database.

### 1.3 Microservice Overview

| Service            | Description                                          | Example Port | Example Container Name |
|--------------------|------------------------------------------------------|--------------|------------------------|
| API Gateway        | Entry point, routing, serves UI                      | 8080         | `api-gateway`          |
| User Service       | Users, auth, 2FA                                     | 8081         | `user-service`         |
| Auction Service    | Auctions, bids, winners                              | 8082         | `auction-service`      |
| Catalogue Service  | Item catalogue, search                               | 8083         | `catalogue-service`    |
| Payment Service    | Totals, payment processing, receipts                 | 8084         | `payment-service`      |
| Shipping Service   | Shipping options and shipment records                | 8085         | `shipping-service`     |

Edit ports and names above to match your actual `docker-compose.yml`.

---

## 2. Environments & URLs

### 2.1 Environments

For this project, a single **local/demo** environment is assumed.

- **Environment name:** `local`  
- **Host:** `localhost` or VM IP provided by TA  
- **Docker orchestration:** `docker-compose` (single host)

### 2.2 Base URLs

- **Web UI & API Gateway:**  
  - `http://localhost:8080` (adjust port if needed)

Through the gateway, the following logical paths are exposed (example):

- `/api/users/**` → User Service  
- `/api/auctions/**` → Auction Service  
- `/api/catalogue/**` → Catalogue Service  
- `/api/payments/**` → Payment Service  
- `/api/shipping/**` → Shipping Service  

If you implement health endpoints, typical URLs might be:

- `GET http://localhost:8080/actuator/health` – gateway health  
- `GET http://localhost:8081/actuator/health` – user-service health  
- `GET http://localhost:8082/actuator/health` – auction-service health  
- etc.

---

## 3. Services

This section describes each service, its purpose, port, database, and dependencies. Update port numbers and names to match your implementation.

### 3.1 API Gateway / Web Frontend

- **Purpose**
  - Entry point for all browser traffic.
  - Serves HTML/CSS/JS for the UI (login, catalogue, bidding, payment).
  - Routes API calls to downstream services.
  - Central place for authentication and cross-cutting concerns.
- **Tech stack:** {{Java/Spring Boot/Node.js/etc.}}  
- **Container name (example):** `api-gateway`  
- **Port:** `8080`  
- **Depends on:** User, Auction, Catalogue, Payment, Shipping services.

### 3.2 User Service

- **Purpose**
  - User registration and login.
  - Authentication and (optionally) 2FA.
  - Basic user profile and billing info.
- **Tech stack:** {{Java/Spring Boot/etc.}}  
- **Container name:** `user-service`  
- **Port:** `8081`  
- **Database:** `UserDB`  
- **Depends on:** `UserDB`, optional Email provider.

### 3.3 Auction Service

- **Purpose**
  - Create and manage auctions.
  - Accept and validate bids.
  - Track auction state and determine winners.
- **Container name:** `auction-service`  
- **Port:** `8082`  
- **Database:** `AuctionDB`  
- **Depends on:** `AuctionDB`, User Service (for user validation).

### 3.4 Catalogue Service

- **Purpose**
  - Store item metadata (title, description, shipping days, etc.).
  - Provide keyword-based search for the catalogue page.
  - Provide details for an individual item.
- **Container name:** `catalogue-service`  
- **Port:** `8083`  
- **Database:** `CatalogueDB`  
- **Depends on:** `CatalogueDB`.

### 3.5 Payment Service

- **Purpose**
  - Generate payment summaries for won auctions.
  - Process payments (using a mock or sandbox payment provider).
  - Persist payment records and statuses.
- **Container name:** `payment-service`  
- **Port:** `8084`  
- **Database:** `PaymentDB`  
- **Depends on:** `PaymentDB`, Auction Service, User Service, external Payment Provider (mock).

### 3.6 Shipping Service

- **Purpose**
  - Calculate shipping estimates for items.
  - Create shipment records after successful payment.
  - Store shipping addresses, tracking numbers, and shipment status.
- **Container name:** `shipping-service`  
- **Port:** `8085`  
- **Database:** `ShippingDB`  
- **Depends on:** `ShippingDB`, Payment Service, User Service, Auction Service, optional Carrier APIs.

---

## 4. Prerequisites

Before deploying the system, ensure the following prerequisites are met.

### 4.1 Software

- **Docker** and **docker-compose** installed.  
- (Alternative, if not using Docker):  
  - JDK {{17+}}  
  - Maven or Gradle  
  - Local installation of {{PostgreSQL/MySQL}}.

### 4.2 Configuration

Configuration may be provided via a `.env` file or environment variables in `docker-compose.yml`.

Typical values:

- User Service
  - `USER_DB_URL=jdbc:postgresql://user-db:5432/userdb`
  - `USER_DB_USERNAME={{user}}`
  - `USER_DB_PASSWORD={{password}}`
- Auction Service
  - `AUCTION_DB_URL=jdbc:postgresql://auction-db:5432/auctiondb`
  - `AUCTION_DB_USERNAME={{user}}`
  - `AUCTION_DB_PASSWORD={{password}}`
- Catalogue Service
  - `CATALOGUE_DB_URL=jdbc:postgresql://catalogue-db:5432/cataloguedb`
  - `CATALOGUE_DB_USERNAME={{user}}`
  - `CATALOGUE_DB_PASSWORD={{password}}`
- Payment Service
  - `PAYMENT_DB_URL=jdbc:postgresql://payment-db:5432/paymentdb`
  - `PAYMENT_DB_USERNAME={{user}}`
  - `PAYMENT_DB_PASSWORD={{password}}`
  - `PAYMENT_PROVIDER_URL={{http://mock-payment-provider:port}}`
- Shipping Service
  - `SHIPPING_DB_URL=jdbc:postgresql://shipping-db:5432/shippingdb`
  - `SHIPPING_DB_USERNAME={{user}}`
  - `SHIPPING_DB_PASSWORD={{password}}`

Common secrets (if used):

- `JWT_SECRET={{your-secret}}`  
- `EMAIL_SMTP_HOST={{smtp.example.com}}`  
- `EMAIL_SMTP_PORT={{587}}`  

Update as necessary for your project.

---

## 5. Deployment & Startup Procedures

### 5.1 Clone Repository

```bash
git clone https://github.com/jhaniff/EECS4413-Auction-Site.git
cd /auction-platform - (For SpringBoot Sevice)
cd /frontend - (For React App)
```

### 5.2 Build Docker Images

If using `docker-compose` with build sections:

    docker-compose build

Or build individual service images (example):

    docker build -t user-service ./user-service
    docker build -t auction-service ./auction-service
    docker build -t catalogue-service ./catalogue-service
    docker build -t payment-service ./payment-service
    docker build -t shipping-service ./shipping-service
    docker build -t api-gateway ./api-gateway

Update image names and paths to match your actual project structure.

### 5.3 Start All Services

Start all microservices and databases:

    docker-compose up -d

This should start:

- All microservice containers  
- All corresponding database containers  
- The API Gateway / Web Frontend

### 5.4 Verify System Is Running

1. **Check containers**

       docker-compose ps

   All services should be in `Up` state.

2. **Check gateway health**

       curl http://localhost:8080/actuator/health

   (Or your equivalent health endpoint.)

3. **Check individual service health** (optional)

       curl http://localhost:8081/actuator/health   # User Service
       curl http://localhost:8082/actuator/health   # Auction Service
       curl http://localhost:8083/actuator/health   # Catalogue Service
       curl http://localhost:8084/actuator/health   # Payment Service
       curl http://localhost:8085/actuator/health   # Shipping Service

4. **Open the web UI**

   - Navigate to `http://localhost:8080` in a browser.  
   - You should see the login / catalogue page.

---

## 6. Stopping & Restarting

### 6.1 Stop Entire System

To stop all services and databases while preserving volumes:

    docker-compose down

### 6.2 Restart Entire System

To fully restart the system:

    docker-compose down
    docker-compose up -d

### 6.3 Restart a Single Service

Example for Auction Service:

    docker-compose restart auction-service

(Substitute `auction-service` with the name of the service you want to restart.)

### 6.4 View Logs

- **All services**

      docker-compose logs

- **Specific service (e.g., Payment Service)**

      docker-compose logs -f payment-service

Use this when debugging issues with a particular service.

---

## 7. Health Checks & Monitoring

### 7.1 Health Endpoints (if enabled)

Typical health endpoints:

- Gateway: `GET /actuator/health` on port `8080`  
- User Service: `GET /actuator/health` on port `8081`  
- Auction Service: `GET /actuator/health` on port `8082`  
- Catalogue Service: `GET /actuator/health` on port `8083`  
- Payment Service: `GET /actuator/health` on port `8084`  
- Shipping Service: `GET /actuator/health` on port `8085`  

A healthy service typically returns HTTP 200 with JSON such as:

```json
{
  "status": "UP"
}
```

## 7.2 Log Monitoring

Use `docker-compose logs -f <service-name>` to tail logs.

Look for:

- Startup stack traces
- Database connection errors
- Timeouts when calling other services
- Unexpected HTTP 5xx errors

## 8. Common Operational Tasks

### 8.1 Create a Test User

**Via UI**

1. Open http://localhost:8080
2. Click Sign Up (or equivalent)
3. Fill in required fields and submit

**Via API (example)**

curl -X POST http://localhost:8080/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test1234!"
      }'

Update the path/body to match your actual API.

### 8.2 Create a Test Item & Auction

**Create an item via Catalogue API or UI (example):**

curl -X POST http://localhost:8080/api/catalogue/items \
  -H "Content-Type: application/json" \
  -d '{
        "title": "Test Item",
        "description": "Sample item for demo",
        "shippingDays": 3
      }'

**Create an auction for that item (example):**

curl -X POST http://localhost:8080/api/auctions \
  -H "Content-Type: application/json" \
  -d '{
        "itemId": 1,
        "startPrice": 10,
        "durationMinutes": 60
      }'

**Bid & pay using the UI:**

1. Search for Test Item in the catalogue
2. Select it and click Bid
3. Place a bid
4. After the auction ends (or you simulate the end), proceed to payment

Adjust endpoints and payloads to match your actual controllers.

## 9. Troubleshooting

This section maps common symptoms to likely causes and remediation steps.

### 9.1 UI Loads but Login Fails

**Symptoms**

- http://localhost:8080 loads successfully
- Login attempts fail with errors or HTTP 5xx responses

**Possible Causes**

- User Service container is down
- UserDB is not running or is misconfigured
- API Gateway route to User Service is incorrect

**Steps**

1. Check container state:

docker-compose ps

2. Ensure user-service and user-db (or equivalent) are Up

3. If user-service is down, inspect logs:

docker-compose logs user-service

4. Fix configuration issues (DB URL, credentials), then restart:

docker-compose restart user-service

5. Verify User Service health:

curl http://localhost:8081/actuator/health

6. Confirm API Gateway routing configuration for `/api/users/**`

### 9.2 Catalogue Page Shows No Items

**Symptoms**

- UI loads, but the catalogue displays "No items found" even though you expect data

**Possible Causes**

- Catalogue Service is down
- CatalogueDB is empty (seed data never loaded)
- Search keyword does not match any items
- API Gateway route to Catalogue Service is misconfigured

**Steps**

1. Check Catalogue Service status:

docker-compose ps
curl http://localhost:8083/actuator/health
docker-compose logs catalogue-service

2. Confirm that items exist in the database:
   - Connect to CatalogueDB and query the items table, or
   - Re-run seed scripts or create a test item via API (see §8.2)

3. Verify that the UI is calling the correct endpoint and that the endpoint returns JSON with items

### 9.3 Payments Always Fail

**Symptoms**

- User reaches the payment page
- Payment attempts consistently fail or remain stuck in a "failed" state

**Possible Causes**

- Payment Service cannot reach the Payment Provider (mock URL is wrong)
- Payment Service cannot connect to PaymentDB
- Payment Service cannot fetch final auction data from Auction Service

**Steps**

1. Check Payment Service logs:

docker-compose logs payment-service

2. Verify environment variables:
   - `PAYMENT_PROVIDER_URL`
   - `PAYMENT_DB_URL`, `PAYMENT_DB_USERNAME`, `PAYMENT_DB_PASSWORD`

3. Test the Payment Provider (if external mock):

curl {{PAYMENT_PROVIDER_URL}}/health

4. Check Auction Service health and logs:

curl http://localhost:8082/actuator/health
docker-compose logs auction-service

### 9.4 5xx Errors When Placing Bids

**Symptoms**

- Catalogue page works
- Attempting to place a bid returns HTTP 500 or 503

**Possible Causes**

- Auction Service is down
- AuctionDB connection issues
- Invalid request payload from the UI

**Steps**

1. Check Auction Service:

docker-compose ps
docker-compose logs auction-service

2. Verify Auction Service health:

curl http://localhost:8082/actuator/health

3. Confirm that the UI request payload matches the expected API contract (correct fields, types, and URLs)

## 10. Resetting & Seeding Data

### 10.1 Reset Databases (Destructive Operation)

**Warning:** This operation removes all persistent data (volumes).

To completely reset the databases:

docker-compose down -v
docker-compose up -d

`-v` removes volumes, wiping all database contents.

After restart, you must run seed scripts or recreate test data via API/GUI.

### 10.2 Reseed Sample Data

If you provide seed scripts, document how to run them here. Example for PostgreSQL:

# Example: run DB schema & seed for UserDB
docker exec -it user-db psql -U {{user}} -d userdb \
  -f /docker-entrypoint-initdb.d/init-user.sql

# Example: run DB schema & seed for CatalogueDB
docker exec -it catalogue-db psql -U {{user}} -d cataloguedb \
  -f /docker-entrypoint-initdb.d/init-catalogue.sql

