@echo off
title CivicEye - Startup
color 0A

echo ========================================
echo       CivicEye - Starting Application
echo ========================================
echo.

REM ── Backend Setup ─────────────────────────────────────
if not exist "backend\venv" (
    echo [SETUP] First time setup detected...
    echo [SETUP] Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    echo [SETUP] Installing backend dependencies...
    pip install -r requirements.txt
    pip install argon2-cffi
    cd ..
    echo [SETUP] Backend setup complete!
    echo.
) else (
    echo [SETUP] Updating backend dependencies...
    cd backend
    call venv\Scripts\activate
    pip install -r requirements.txt --quiet
    cd ..
    echo.
)

REM ── Flutter Setup ─────────────────────────────────────
echo [SETUP] Installing/updating Flutter dependencies...
cd civic_eye_app
flutter pub get
cd ..
echo.

REM ── Start Backend ─────────────────────────────────────
echo [START] Starting Backend Server...
start "CivicEye Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 5 /nobreak >nul

REM ── Start Flutter App ─────────────────────────────────
echo [START] Starting Flutter App (Chrome)...
start "CivicEye Flutter" cmd /k "cd civic_eye_app && flutter run -d chrome --web-browser-flag --disable-web-security --web-header Cross-Origin-Opener-Policy=same-origin --web-header Cross-Origin-Embedder-Policy=require-corp"

echo.
echo ========================================
echo       Application Started!
echo ========================================
echo.
echo  Backend API : http://localhost:8000
echo  API Docs    : http://localhost:8000/docs
echo  Flutter App : Opening in Chrome...
echo.
echo  NOTE: The Flutter app uses local SQLite storage.
echo  Backend is optional (for AI prediction features).
echo.
echo Press any key to close this window...
pause >nul
