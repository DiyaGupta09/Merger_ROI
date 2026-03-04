@echo off
REM Merger ROI Dashboard - Windows Startup Script

echo ========================================
echo Merger ROI Dashboard - Startup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file:
    echo   1. Copy .env.example to .env
    echo   2. Set DB_PASSWORD in .env
    echo.
    echo Example:
    echo   copy .env.example .env
    echo   notepad .env
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✓ Docker is installed

echo.
echo [2/4] Stopping existing containers...
docker-compose down

echo.
echo [3/4] Building and starting containers...
echo This may take a few minutes on first run...
docker-compose up --build -d

echo.
echo [4/4] Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Dashboard is starting up!
echo ========================================
echo.
echo Services:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo   Health:    http://localhost:8000/api/health
echo.
echo Checking health...
timeout /t 5 /nobreak >nul

curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠ Services are still starting up...
    echo Please wait 30 seconds and check:
    echo   http://localhost:8000/api/health
) else (
    echo ✓ Backend is healthy!
)

echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo.
pause
