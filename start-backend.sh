#!/bin/bash

# Start infrastructure services
echo "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready (optional, but good practice)
echo "Waiting for services to initialize..."
sleep 5

# Navigate to backend directory
cd backend

# Check for .env file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Start the Go backend
echo "Starting Go backend..."
go run cmd/api/main.go
