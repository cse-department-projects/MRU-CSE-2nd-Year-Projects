@echo off
title Smart Career Frontend (Port 5173)
color 0a

echo Starting Smart Career Frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
call npm install
call npm run dev
pause
