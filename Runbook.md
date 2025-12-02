
# EECS 4413 Auction Platform – Runbook (Microservices Deployment)

_Last updated: 2025-11-26_  
_Owners: Joshua Hanif, Farah Madkour, George Yousif, Sandeepon Saha, Matthew Patrus_

---

## 1. Overview

### 1.1 Purpose

This runbook describes how to deploy, start, stop, monitor, and troubleshoot the **Auction Platform** in its **microservice** deployment. It is intended for developers, TAs, and operators who need to:

- Bring the system up from scratch (e.g., on a new machine or VM).  
- Verify that all microservices are healthy.  
- Diagnose and resolve common runtime issues.

### 1.2 System Description

The Auction Platform allows authenticated users to:

- Register, sign in, and reset their password via email links captured by Mailhog.  
- Browse active auctions in the catalogue view.  
- Sell items (which automatically spin up matching auctions).  
- Place bids in real time and review their bidding history.  
- Initiate payment flows for completed auctions.

The deployed stack uses the following components:

- **Service Registry (Eureka)** – central registry for service discovery and health.  
- **API Gateway** – single entry point exposed on `:8080`; terminates JWT auth and routes to downstream services.  
- **Authentication Service** – user accounts, JWT issuance/validation, forgot-password flows.  
- **Auction Service** – auction search, detail, bid placement, user bid summaries.  
- **Item Service** – item onboarding and automatic auction creation.  
- **Payment Service** – payment records (mocked provider).  
- **PostgreSQL** – shared database used by all Spring Boot services via schema/tables.  
- **Mailhog** – SMTP sink used for password reset emails.

All backend services are Spring Boot applications that communicate over HTTP using the gateway. Each service registers with Eureka for lookup, and they all share a single Postgres instance configured through a common `.env` file.

### 1.3 Microservice Inventory

| Service              | Description                                      | Port | Container |
|----------------------|--------------------------------------------------|------|-----------|
| Service Registry     | Eureka discovery UI & heartbeat hub              | 8761 | `eureka-server` |
| API Gateway          | Browser entry point, JWT validation, routing     | 8080 | `api-gateway` |
| AuthenticationSvc    | Register/login/logout, token validation, forgot password | 8084 | `authentication-service` |
| Auction Service      | Auction search/detail, bidding, user bid reports | 8081 | `auction-service` |
| Item Service         | Item CRUD and automatic auction bootstrapping    | 8083 | `item-service` |
| Payment Service      | Payment summaries and status tracking            | 8082 | `payment-service` |
| PostgreSQL           | Persistent storage for all services              | 5432 | `postgres` |
| Mailhog              | Test SMTP + web UI for emails                    | 8025 | `mailhog` |

Only the API Gateway and Eureka UI are meant to be accessed directly from the host machine; the other service ports are published primarily for debugging.

---

## 2. Environments & URLs

### 2.1 Environments

This runbook targets the single **local/demo** environment described in `microservices/docker-compose.yml`.

- **Environment name:** `local`  
- **Host:** `localhost` (or your VM IP)  
- **Orchestration:** Docker Compose (single host)

### 2.2 Base URLs

- **Gateway + Web UI:** `http://localhost:8080`
- **Eureka Dashboard:** `http://localhost:8761`
- **Mailhog UI:** `http://localhost:8025` (SMTP port `1025`)
- **Dev Frontend (Vite during local dev):** `http://localhost:5173`

Gateway routing of interest:

- `/api/auth/**` → Authentication Service
- `/api/auction/**` → Auction Service
- `/api/items/**` → Item Service
- `/api/payments/**` → Payment Service

When health endpoints are enabled, use `GET http://localhost:<port>/actuator/health` for each service (see §7).

---

## 3. Services

### 3.1 Service Registry (Eureka)

- **Purpose**: Provides service discovery and live status, required before other services join the cluster.  
- **Tech stack**: Spring Boot / Netflix Eureka.  
- **Port**: `8761` (UI available via browser).  
- **Container**: `eureka-server`.  
- **Depends on**: None.

### 3.2 API Gateway

- **Purpose**: Terminates browser traffic, enforces JWT authentication, forwards REST calls to the correct downstream service, and proxies the Vite build output.  
- **Port**: `8080`.  
- **Container**: `api-gateway`.  
- **Depends on**: Eureka, Authentication, Auction, Item, Payment services.

### 3.3 Authentication Service

- **Purpose**: Registration, login, logout, forgot/reset password, JWT validation endpoints, and propagation of `AuthenticatedUserId` headers used by downstream services.  
- **Port**: `8084`.  
- **Container**: `authentication-service`.  
- **Depends on**: Eureka, PostgreSQL, Mailhog (SMTP).

### 3.4 Auction Service

- **Purpose**: Manages auctions, exposes search/detail endpoints, handles bid placement, and produces the `/api/auction/my-bids` summary view.  
- **Port**: `8081`.  
- **Container**: `auction-service`.  
- **Depends on**: Eureka, PostgreSQL, Authentication (for user validation).

### 3.5 Item Service

- **Purpose**: Handles seller onboarding (item metadata, shipping rules, keywords) and automatically creates a corresponding auction once an item is stored.  
- **Port**: `8083`.  
- **Container**: `item-service`.  
- **Depends on**: Eureka, PostgreSQL, Authentication.

### 3.6 Payment Service

- **Purpose**: Builds payment summaries, records mock payments, and reports payment status to other services.  
- **Port**: `8082`.  
- **Container**: `payment-service`.  
- **Depends on**: Eureka, PostgreSQL.

### 3.7 PostgreSQL

- **Purpose**: Shared data store (`auction` database) accessed via JDBC URLs defined in the `.env`.  
- **Port**: `5432` (mapped to host for debugging).  
- **Container**: `postgres`.  
- **Depends on**: Persistent Docker volume `postgres_data`.

### 3.8 Mailhog

- **Purpose**: Captures outbound email so password reset flows can be tested locally without external SMTP.  
- **Ports**: SMTP `1025`, Web UI `8025`.  
- **Container**: `mailhog`.  
- **Depends on**: None.

---

## 4. Prerequisites

### 4.1 Software

- Docker Desktop (or Docker Engine) with Compose V2.  
- Optional: Java 17+ and Maven if you want to run services outside Docker.  
- Optional: Node.js 20+ / pnpm if you plan to run the Vite frontend separately.

### 4.2 Configuration

All service configuration is driven by environment variables defined in `microservices/.env`. Sample values (current defaults):

```
DB_URL=jdbc:postgresql://postgres:5432/auction
DB_USERNAME=postgres
DB_PASSWORD=<redacted>
JWT_SECRET_KEY=your-jwt-secret
FORGOT_PASSWORD_SECRET=reset-secret
MAIL_HOST=mailhog
MAIL_PORT=1025
FRONTEND_URL=http://localhost:5173
KEYSTORE_PASSWORD=changeit
KEYSTORE_LOCATION=classpath:gateway-keystore.p12
KEYSTORE_TYPE=PKCS12
```

- `DB_*` values are shared by Authentication, Auction, Item, and Payment services.  
- `JWT_SECRET_KEY` is used by the Authentication Service to sign tokens; keep this secret.  
- `FORGOT_PASSWORD_SECRET` signs the forgot-password codes stored in the DB.  
- `MAIL_HOST` / `MAIL_PORT` ensure emails are routed to Mailhog in local deployments.  
- `FRONTEND_URL` is embedded in password reset emails so links open the React app.

Frontend-specific configuration lives under `frontend/.env` (committed defaults) or `frontend/.env.local` (developer overrides). The React app reads `VITE_*` variables at build time; the only required one today is:

```
VITE_API_BASE_URL=http://localhost:8080
```

This defaults to the gateway URL, so you only need to set it when pointing the UI at a different host/port.

Copy `.env.example` to `.env` if one is provided, or edit the existing file with local secrets before running Compose.

---

## 5. Deployment & Startup Procedures

### 5.1 Clone Repository

```bash
git clone https://github.com/jhaniff/EECS4413-Auction-Site.git
cd EECS4413-Auction-Site
```

### 5.2 Configure Environment

```bash
cd microservices
cp .env.example .env   # if example exists; otherwise edit .env directly
```

Fill in the `.env` values described in §4.2. The Compose stack reads this file automatically.

### 5.3 Build Docker Images

From the `microservices` directory:

```bash
docker compose build
```

This compiles each Spring Boot service and creates the following images: `eureka-server`, `api-gateway`, `authentication-service`, `auction-service`, `item-service`, and `payment-service`.

### 5.4 Start All Services

```bash
docker compose up -d
```

Compose will start:

- Eureka, API Gateway, Authentication, Auction, Item, Payment services.  
- PostgreSQL with persistent volume `postgres_data`.  
- Mailhog SMTP sink.

### 5.5 Verify System Health

1. **Check containers**

   ```bash
   docker compose ps
   ```

   All containers should display `Up`.

2. **Check Eureka dashboard** – open `http://localhost:8761` and confirm all services are registered (`UP`).

3. **Hit health endpoints (optional)**

   ```bash
   curl http://localhost:8080/actuator/health        # gateway
   curl http://localhost:8081/actuator/health        # auction-service
   curl http://localhost:8082/actuator/health        # payment-service
   curl http://localhost:8083/actuator/health        # item-service
   curl http://localhost:8084/actuator/health        # authentication-service
   ```

4. **Open the UI** – during local frontend development, browse to `http://localhost:5173` (Vite dev server) or to whatever static host you used for the built assets. Login/register to test end-to-end.

### 5.6 Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

Use Node.js 20+ (the project was tested with Node 20.17). Re-run `npm install` whenever dependencies change.

### 5.7 Run the React Dev Server

```bash
npm run dev
```

- Vite serves the SPA on `http://localhost:5173` with hot module reloading.  
- The app calls the gateway at `VITE_API_BASE_URL` (default `http://localhost:8080`). Ensure the Docker Compose stack is running so API calls succeed.  
- JWTs are stored in `localStorage` under `authToken`; clear it if you need a clean session.

To lint while developing, run `npm run lint` in another terminal.

### 5.8 Build & Preview Production Assets

```bash
npm run build    # emits optimized bundle to frontend/dist
npm run preview  # optional: serve the build locally on http://localhost:4173
```

The resulting `frontend/dist` directory can be hosted by any static file server (Nginx, S3, etc.) or copied into a Spring Boot resource folder if you later decide to serve the SPA through the gateway. When deploying behind the gateway, keep `VITE_API_BASE_URL` pointing at the gateway URL so the built bundle hits the right APIs.

---

## 6. Stopping & Restarting

### 6.1 Stop the Stack

```bash
docker compose down
```

Services shut down but volumes persist.

### 6.2 Full Restart

```bash
docker compose down
docker compose up -d
```

### 6.3 Restart a Single Service

```bash
docker compose restart auction-service
```

Swap `auction-service` with the container you need to restart.

### 6.4 View Logs

```bash
docker compose logs -f api-gateway
docker compose logs -f authentication-service
```

Tail individual services to diagnose issues. Use `--since 10m` to limit output.

---

## 7. Health Checks & Monitoring

- `docker compose ps` – quick status.  
- `http://localhost:8761` – Eureka UI shows current status and last heartbeat per service.  
- `GET /actuator/health` – each service exposes Spring Boot Actuator endpoints.  
- `docker compose logs -f <service>` – streaming logs for troubleshooting.

Example healthy response:

```json
{
  "status": "UP"
}
```

---

## 8. Common Operational Tasks

### 8.1 Create a Test User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "firstName": "Test",
        "lastName": "User",
        "email": "test@example.com",
        "password": "Test1234!",
        "address": "123 Demo St"
      }'
```

Login via CLI or UI:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

The response contains the JWT required for authenticated calls.

### 8.2 Create a Test Item + Auction

Item creation automatically triggers auction creation. Provide the JWT in the `Authorization` header:

```bash
TOKEN="Bearer <jwt>"
curl -X POST http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: ${TOKEN}" \
  -d '{
        "name": "Vintage Camera",
        "description": "1960s rangefinder",
        "type": "Forward",
        "shippingDays": 5,
        "baseShipCost": 20,
        "expeditedCost": 45,
        "keywords": ["camera", "vintage"]
      }'
```

Use the Catalogue UI (or `/api/auction/search`) to confirm the auction was created.

### 8.3 Place a Test Bid

```bash
curl -X POST http://localhost:8080/api/auction/{auctionId}/bid \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150.00}'
```

Check `/api/auction/my-bids` or the **My Bids** page in the UI to confirm the bid landed.

### 8.4 Inspect Password Reset Emails

Trigger `/api/auth/forgot` with a known email, then open `http://localhost:8025` to view the reset link captured by Mailhog.

---

## 9. Troubleshooting

### 9.1 UI Loads but Login Fails

- **Likely causes**: `authentication-service` down, Postgres unavailable, incorrect JWT secret, Mailhog unreachable (for forgot flow).  
- **Actions**: `docker compose logs authentication-service`, verify DB env vars, ensure tokens match values configured in API Gateway.

### 9.2 Catalogue Empty or Bids Fail

- **Likely causes**: `auction-service` unhealthy, database migrations missing, or gateway cannot resolve the service via Eureka.  
- **Actions**: Check Eureka dashboard, hit `curl http://localhost:8081/actuator/health`, confirm `auction-service` logs show successful DB connection.

### 9.3 Item Creation Errors

- **Likely causes**: Missing JWT header (results in 401), `item-service` offline, or DB schema mismatch.  
- **Actions**: Validate the `Authorization` header is forwarded, check `item-service` logs for SQL exceptions, confirm `docker compose ps` shows the container up.

### 9.4 Payment Failures

- **Likely causes**: `payment-service` can’t reach Postgres, service still starting when the UI calls it, or upstream auction data missing.  
- **Actions**: Tail `docker compose logs payment-service`, ensure `payment-service` registered with Eureka, verify auctions exist for the requested IDs.

### 9.5 Forgot-Password Email Missing

- **Likely causes**: Mailhog not running or `MAIL_HOST` misconfigured.  
- **Actions**: Visit `http://localhost:8025`; if empty, inspect `docker compose logs mailhog` and confirm `.env` entries match service names.

---

## 10. Resetting & Seeding Data

### 10.1 Reset the Database (Destructive)

```bash
docker compose down -v
docker compose up -d
```

Dropping volumes wipes the `auction` database. Recreate demo data afterwards (see §8).

### 10.2 Manual SQL Access / Seeding

```bash
docker exec -it postgres psql -U ${DB_USERNAME} -d auction
```

From the psql prompt you can run schema or seed scripts. Store any repeatable SQL under `microservices/setup-script.sh` and execute via:

```bash
./setup-script.sh
```

This script applies schema migrations and inserts baseline data for demos.

---

The runbook now reflects the actual services, ports, and operational steps defined in `microservices/docker-compose.yml`.
