@echo off
title UrbanSim AI - Startup
color 0A

echo ========================================
echo    UrbanSim AI - Starting Application
echo ========================================
echo.

REM Check if this is first run
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
    echo [SETUP] Setup complete!
    echo.
)

if not exist "flutter_app\.dart_tool" (
    echo [SETUP] Installing Flutter dependencies...
    cd flutter_app
    flutter pub get
    cd ..
    echo.
)

echo [START] Starting Backend Server...
start "UrbanSim Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 5 /nobreak >nul

echo [START] Starting Flutter App...
start "UrbanSim Flutter" cmd /k "cd flutter_app && flutter run -d chrome"

echo.
echo ========================================
echo    Application Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Flutter App: Opening in Chrome...
echo.
echo Press any key to exit this window...
pause >nul
