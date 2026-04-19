@echo off
title CivicEye - Startup
color 0A

echo ========================================
echo       CivicEye - Starting Application
echo ========================================
echo.

REM ── Backend Setup ─────────────────────────────────────
if not exist "%~dp0backend\venv" (
    echo [SETUP] First time setup - creating Python virtual environment...
    cd /d "%~dp0backend"
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    pip install argon2-cffi
    cd /d "%~dp0"
    echo [SETUP] Backend setup complete!
    echo.
) else (
    echo [SETUP] Updating backend dependencies...
    cd /d "%~dp0backend"
    call venv\Scripts\activate
    pip install -r requirements.txt --quiet
    cd /d "%~dp0"
    echo.
)

REM ── Flutter Setup ─────────────────────────────────────
echo [SETUP] Installing/updating Flutter dependencies...
cd /d "%~dp0civic_eye_app"
flutter pub get
cd /d "%~dp0"
echo.

REM ── Launch Backend ────────────────────────────────────
echo [START] Launching Backend Server...
powershell -Command "Start-Process powershell -ArgumentList '-NoExit -ExecutionPolicy Bypass -File ""%~dp0_run_backend.ps1""' -WindowStyle Normal"

echo [INFO] Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

REM ── Launch Flutter ────────────────────────────────────
echo [START] Launching Flutter App...
powershell -Command "Start-Process powershell -ArgumentList '-NoExit -ExecutionPolicy Bypass -File ""%~dp0_run_flutter.ps1""' -WindowStyle Normal"

echo.
echo ========================================
echo       Application Started!
echo ========================================
echo.
echo  Backend API : http://localhost:8000
echo  API Docs    : http://localhost:8000/docs
echo  Flutter App : Opening in Chrome...
echo.
echo Press any key to close this window...
pause >nul
