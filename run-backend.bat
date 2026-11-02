@echo off
title Smart Career Backend (Port 8080)
color 0e

echo Starting Smart Career Spring Boot Backend on http://localhost:8080 ...
cd /d "%~dp0backend"
call mvn spring-boot:run
pause
