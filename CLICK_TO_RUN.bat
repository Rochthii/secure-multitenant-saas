@echo off
title Chantarangsay Website Launcher
color 0f

echo ===================================================
echo   CHANTARANGSAY WEBSITE - LAUNCHER
echo ===================================================
echo.

:: 0. Clean Setup
echo [1/3] Cleaning up old Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

:: 1. Start Next.js Frontend (Port 3000)
echo [2/3] Starting Next.js Frontend (Port 3000)...
cd /d "%~dp0"
start "Next.js Frontend" cmd /k "npm run dev"

:: 2. Wait for server
echo [3/3] Waiting for server to start...
:wait_loop
timeout /t 2 /nobreak >nul
curl -I http://localhost:3000 >nul 2>&1
if %errorlevel% NEQ 0 (
    echo       ... Server starting ...
    goto wait_loop
)

:: 3. Open Browser
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000
start http://localhost:3000/admin

echo.
echo ===================================================
echo   SUCCESS! Website is RUNNING
echo   - Frontend: http://localhost:3000
echo   - Admin:    http://localhost:3000/admin
echo ===================================================
echo.
echo Press any key to stop the server...
pause >nul

:: Stop servers on exit
taskkill /F /IM node.exe >nul 2>&1
echo Server stopped.
pause
