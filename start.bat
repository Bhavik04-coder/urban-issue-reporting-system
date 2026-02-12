@echo off
REM ================================================
REM  UrbanSim AI — One-Command Startup (Windows)
REM ================================================

echo.
echo  =========================================
echo   UrbanSim AI — Starting All Services
echo  =========================================
echo.

REM --- Check virtual environment ---
if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found at .venv\
    echo         Run: python -m venv .venv
    echo         Then: .venv\Scripts\activate ^&^& pip install -r requirements.txt
    exit /b 1
)

REM --- Activate venv ---
call .venv\Scripts\activate.bat

REM --- Initialize database (idempotent) ---
echo [1/3] Initializing database...
cd backend
python init_db_simple.py
cd ..
echo       Done.

REM --- Start Backend (background) ---
echo [2/3] Starting Backend on http://localhost:8000 ...
start "UrbanSim-Backend" cmd /k "cd backend && ..\\.venv\\Scripts\\activate.bat && uvicorn main:app --reload --port 8000"

REM --- Start Frontend ---
echo [3/3] Starting Frontend on http://localhost:8081 ...
start "UrbanSim-Frontend" cmd /k "cd frontend\BUILDTHAON-2025-frontend && npx expo start --web"

echo.
echo  =========================================
echo   All services started!
echo   Backend:  http://localhost:8000/docs
echo   Frontend: http://localhost:8081
echo  =========================================
echo.
