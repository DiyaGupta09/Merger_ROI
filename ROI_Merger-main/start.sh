#!/bin/bash
# Merger ROI Dashboard - Linux/Mac Startup Script

echo "========================================"
echo "Merger ROI Dashboard - Startup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo ""
    echo "Please create .env file:"
    echo "  1. Copy .env.example to .env"
    echo "  2. Set DB_PASSWORD in .env"
    echo ""
    echo "Example:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo ""
    exit 1
fi

echo "[1/4] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed!"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "✓ Docker is installed"

echo ""
echo "[2/4] Stopping existing containers..."
docker-compose down

echo ""
echo "[3/4] Building and starting containers..."
echo "This may take a few minutes on first run..."
docker-compose up --build -d

echo ""
echo "[4/4] Waiting for services to start..."
sleep 10

echo ""
echo "========================================"
echo "Dashboard is starting up!"
echo "========================================"
echo ""
echo "Services:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo "  Health:    http://localhost:8000/api/health"
echo ""
echo "Checking health..."
sleep 5

if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✓ Backend is healthy!"
else
    echo ""
    echo "⚠ Services are still starting up..."
    echo "Please wait 30 seconds and check:"
    echo "  http://localhost:8000/api/health"
fi

echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""
