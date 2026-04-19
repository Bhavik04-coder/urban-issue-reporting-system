@echo off
title CivicEye - Startup
color 0A

echo ========================================
echo       CivicEye - Starting Application
echo ========================================
echo.

REM ── Backend Setup ─────────────────────────────────────
if not exist "%~dp0backend\venv" (
    echo [SETUP] First time setup detected...
    echo [SETUP] Creating Python virtual environment...
    cd /d "%~dp0backend"
    python -m venv venv
    call venv\Scripts\activate
    echo [SETUP] Installing backend dependencies...
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

REM ── Write helper scripts to avoid quote issues ─────────
echo @echo off > "%~dp0_run_backend.bat"
echo cd /d "%~dp0backend" >> "%~dp0_run_backend.bat"
echo call venv\Scripts\activate >> "%~dp0_run_backend.bat"
echo uvicorn main:app --reload --host 0.0.0.0 --port 8000 >> "%~dp0_run_backend.bat"

echo @echo off > "%~dp0_run_flutter.bat"
echo cd /d "%~dp0civic_eye_app" >> "%~dp0_run_flutter.bat"
echo flutter run -d chrome --web-browser-flag --disable-web-security --web-header Cross-Origin-Opener-Policy=same-origin --web-header Cross-Origin-Embedder-Policy=require-corp >> "%~dp0_run_flutter.bat"

REM ── Start Backend ─────────────────────────────────────
echo [START] Starting Backend Server...
start "CivicEye Backend" cmd /k "%~dp0_run_backend.bat"

echo [INFO] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM ── Start Flutter App ─────────────────────────────────
echo [START] Starting Flutter App (Chrome)...
start "CivicEye Flutter" cmd /k "%~dp0_run_flutter.bat"

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
bhavik