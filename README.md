# Appointment Booking Service

A production-style, event-driven appointment booking system designed to demonstrate modern backend engineering practices in Go.

## 🏗 Architecture

**Stack**:
- **Backend**: Go (1.23+)
- **Database**: PostgreSQL (System of Record), DynamoDB (Read Model)
- **Messaging**: RabbitMQ
- **Frontend**: React 19 (Web), Ionic 8 / Angular 20 (Mobile)

**Flow**:
1. User books via API -> Writes to Postgres.
2. API publishes `AppointmentCreated` event.
3. Worker consumes event -> Updates DynamoDB & sends notification.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Go 1.23+
- Node.js 20+

### Local Development

1. **Start Infrastructure**
   ```bash
   docker-compose up -d postgres rabbitmq localstack
   ```

2. **Run Migrations**
   ```bash
   make migrate-up
   ```

3. **Start Services**
   ```bash
   # Terminal 1: API
   go run cmd/api/main.go

   # Terminal 2: Worker
   go run cmd/worker/main.go
   ```

4. **Start Web Frontend**
   ```bash
   # Terminal 3: Web
   cd web
   npm install
   npm run dev
   ```

5. **Start Mobile App**
   ```bash
   # Terminal 4: Mobile
   cd mobile
   npm install
   npm start
   ```

## 📂 Project Structure

- `cmd/`: Entry points for applications.
- `internal/core`: Pure domain logic (Hexagonal Architecture).
- `internal/adapters`: Infrastructure implementations (SQL, HTTP, AMQP).
- `web/`: React Frontend.
- `mobile/`: Ionic Frontend.

## 🔧 Observability

Access the local dashboard at `http://localhost:8080/metrics`.
Requests include `X-Correlation-ID` for distributed tracing.

## License
MIT
