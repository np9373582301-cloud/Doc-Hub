@echo off
echo ===================================================
echo           Starting DocHub Application
echo ===================================================
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:5173
echo ===================================================
echo.
start "DocHub Backend (Port 5000)" cmd /k "cd /d %~dp0backend && node server.js"
start "DocHub Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Both servers have been launched in separate command windows.

