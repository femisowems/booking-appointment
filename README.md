# Appointment Booking Service

A production-style, event-driven appointment booking system designed to demonstrate modern backend engineering practices in Go.

## 🏗 Architecture

**Stack**:
- **Backend**: Go 1.23+ (Hexagonal Architecture)
- **Database**: PostgreSQL (System of Record), DynamoDB (Read Model)
- **Messaging**: RabbitMQ
- **Frontend (Web)**: React 19, Vite, PrimeReact
- **Frontend (Mobile)**: Ionic 8, Angular 20, Capacitor 8

**Flow**:
1. User books via API -> Writes to Postgres.
2. API publishes `AppointmentCreated` event.
3. Worker consumes event -> Updates DynamoDB & sends notification.

## 🚀 Getting Started

### ⚡ Quick Start (Backend)
Run the following script to start Docker containers and the Go backend automatically:
```bash
./start-backend.sh
```

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
   navigate to the backend directory
   cd backend
   make migrate-up
   ```

3. **Start Services**
   ```bash
   # Terminal 1: API
   cd backend
   go run cmd/api/main.go

   # Terminal 2: Worker
   cd backend
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

- `backend/`: Main Go source code.
  - `cmd/`: Entry points for applications (`api`, `worker`).
  - `pkg/`: Core domain logic and adapters (Hexagonal Architecture).
  - `migrations/`: Database migration files.
- `web/`: React/Vite Frontend.
- `mobile/`: Ionic/Angular Frontend.

## 🔧 Observability

Access the local dashboard at `http://localhost:8080/metrics`.
Requests include `X-Correlation-ID` for distributed tracing.

## License
MIT

## ☁️ Production Deployment

To run the backend in a production environment, use Docker.

### 1. Build the Docker Image
```bash
docker build -t appointment-api ./backend
```

### 2. Run the Container
Enable production mode by providing the necessary environment variables.

```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e DATABASE_URL="postgres://user:pass@host:5432/dbname" \
  -e RABBITMQ_URL="amqp://user:pass@host:5672/" \
  appointment-api
```

> **Note**: For Vercel deployment, the project comes with a `vercel.json` configuration in the `backend` directory.
