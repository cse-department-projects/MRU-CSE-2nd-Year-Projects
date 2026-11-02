@echo off
title Smart Career Guidance System - Launcher
color 0b

echo ===============================================================
echo      SMART CAREER GUIDANCE SYSTEM - STARTING APPLICATION
echo ===============================================================
echo.

echo [1/2] Launching Spring Boot Backend (Port 8080)...
start "Smart Career Backend (Port 8080)" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

echo [2/2] Launching React Frontend (Port 5173)...
start "Smart Career Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"

echo.
echo ===============================================================
echo Both servers are launching in separate windows!
echo.
echo Frontend App: http://localhost:5173
echo Backend API:  http://localhost:8080
echo.
echo Test Credentials:
echo Email:    demo@example.com
echo Password: Demo@123
echo ===============================================================
echo.
pause
