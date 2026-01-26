# Deploying Booking Appointment System to Railway

This guide outlines the steps to deploy the **Booking Appointment System** to [Railway.com](https://railway.app/).

## Prerequisites
- A Railway account (GitHub login recommended).
- The project repository connected to Railway.

## 1. Project Services Setup

This project requires two persistent services:
1. **PostgreSQL**: For storing appointments.
2. **RabbitMQ**: For messaging (notifications, etc.).

### Steps on Railway:
1. Create a `New Project`.
2. Select `Database` -> `Add PostgreSQL`.
3. Click `New` -> `Database` -> `Add RabbitMQ`.

## 2. Deploying the Backend

The backend is a Go application located in the `backend/` directory.

### Configuration
1. **Root Directory**: `backend`
2. **Build Command**: (Leave empty, handled by Dockerfile)
3. **Start Command**: (Leave empty, handled by Dockerfile)

### Environment Variables
Add the following variables in the Backend service settings:
- `DATABASE_URL`: Use the value from the PostgreSQL service (`${{Postgres.DATABASE_URL}}`).
- `RABBITMQ_URL`: Use the value from the RabbitMQ service (`${{RabbitMQ.RABBITMQ_URL}}`).
- `PORT`: `8080` (Railway sets this automatically, but good to double-check).

> [!NOTE]
> The backend automatically runs migrations on startup if a database connection is available.

## 3. Deploying the Web Frontend

The web frontend is a React application located in the `web/` directory. It uses a multi-stage Dockerfile to build the assets and serve them via Nginx.

### Configuration
1. **Root Directory**: `web`
2. **Build Command**: (Leave empty, handled by Dockerfile)
3. **Start Command**: (Leave empty, handled by Dockerfile)

### Environment Variables
Add the following variable in the Web service settings **before** deploying (needed at build time):
- `VITE_API_URL`: The public URL of your deployed Backend service (e.g., `https://backend-production.up.railway.app/api`).

> [!IMPORTANT]
> Since Vite bakes environment variables into the static bundle at build time, if you change `VITE_API_URL`, you must **Redeploy** the Web service.

## 4. Deploying the Mobile PWA

The mobile app is an Ionic Angular application located in the `mobile/` directory. You can deploy it as a Progressive Web App (PWA).

### Configuration
1. **Root Directory**: `mobile`
2. **Build Command**: (Leave empty, handled by Dockerfile)
3. **Start Command**: (Leave empty, handled by Dockerfile)

### Environment Updates
The mobile app uses `src/environments/environment.prod.ts` for production configuration.
- Ensure `apiUrl` in that file points to your deployed Railway Backend URL.
- If you change the URL, you must commit the change and redeploy the Mobile service.

## 5. Verification

1. Open the deployed URLs (Web and Mobile PWA).
2. Try booking an appointment on both.
3. Check Backend service logs to confirm requests are received.
