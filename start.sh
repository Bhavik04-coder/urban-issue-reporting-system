#!/usr/bin/env bash
# ================================================
#  UrbanSim AI — One-Command Startup (macOS/Linux)
# ================================================

set -e

echo ""
echo " ========================================="
echo "  UrbanSim AI — Starting All Services"
echo " ========================================="
echo ""

# --- Check virtual environment ---
if [ ! -d ".venv" ]; then
    echo "[ERROR] Virtual environment not found at .venv/"
    echo "        Run: python3 -m venv .venv"
    echo "        Then: source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# --- Activate venv ---
source .venv/bin/activate

# --- Initialize database (idempotent) ---
echo "[1/3] Initializing database..."
cd backend
python init_db_simple.py
cd ..
echo "      Done."

# --- Start Backend (background) ---
echo "[2/3] Starting Backend on http://localhost:8000 ..."
cd backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# --- Start Frontend ---
echo "[3/3] Starting Frontend on http://localhost:8081 ..."
cd frontend/BUILDTHAON-2025-frontend
npx expo start --web &
FRONTEND_PID=$!
cd ../..

echo ""
echo " ========================================="
echo "  All services started!"
echo "  Backend:  http://localhost:8000/docs"
echo "  Frontend: http://localhost:8081"
echo " ========================================="
echo ""
echo "  Press Ctrl+C to stop all services."

# --- Trap Ctrl+C to kill both ---
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
