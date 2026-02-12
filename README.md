# 🏗️ UrbanSim AI — Smart Urban Issue Redressal

AI-powered urban issue reporting & resolution platform. Citizens report issues via a mobile app; ML models auto-classify and route them to the right municipal department.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI · Python 3.13 · SQLAlchemy (Async) · SQLite |
| **Frontend** | React Native · Expo · TypeScript |
| **AI/ML** | TensorFlow (Image CNN) · Scikit-Learn (Text NLP) |
| **Auth** | JWT · Passlib (bcrypt) |

---

## 📂 Project Structure

```
UrbanismAi/
├── .gitignore              # Single unified gitignore
├── .venv/                  # Single virtual environment (not tracked)
├── requirements.txt        # All Python dependencies
├── start.bat               # One-command startup (Windows)
├── start.sh                # One-command startup (macOS/Linux)
├── README.md               # This file
├── backend/
│   ├── app/                # Models, schemas, database config
│   ├── main.py             # FastAPI entry point
│   ├── init_db_simple.py   # Database seeder
│   ├── image_predict.py    # CNN image classifier
│   ├── predict_text.py     # NLP text classifier
│   ├── civic_eye_model.h5  # Trained CNN model
│   ├── text_classifier.pkl # Trained text model
│   └── requirements.txt    # Backend-specific deps (mirror of root)
└── frontend/
    └── BUILDTHAON-2025-frontend/
        ├── app/            # Expo Router (file-based routing)
        ├── src/            # Components, screens, context
        └── package.json    # Node.js dependencies
```

---

## 🚀 Quick Start (One Command)

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.10 – 3.13 | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

### Step 1 — Clone

```bash
git clone https://github.com/Akhilesh-Gangawane/UrbanismAi.git
cd UrbanismAi
```

### Step 2 — Create Virtual Environment

```bash
python -m venv .venv
```

Activate it:

```bash
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Windows (CMD)
.venv\Scripts\activate.bat

# macOS / Linux
source .venv/bin/activate
```

### Step 3 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Install Frontend Dependencies

```bash
cd frontend/BUILDTHAON-2025-frontend
npm install --legacy-peer-deps
cd ../..
```

### Step 5 — Initialize Database

```bash
cd backend
python init_db_simple.py
cd ..
```

### Step 6 — Launch Everything

**Option A — One command (recommended):**

```bash
# Windows
start.bat

# macOS / Linux
chmod +x start.sh && ./start.sh
```

**Option B — Manual (two terminals):**

Terminal 1 (Backend):
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend/BUILDTHAON-2025-frontend
npx expo start --web
```

### Step 7 — Open in Browser

| Service | URL |
|---------|-----|
| **Backend API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Frontend Dashboard** | [http://localhost:8081](http://localhost:8081) |

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `admin123` |
| **Citizen** | `user@example.com` | `user123` |

---

## ✨ Key Features

- **AI Classification** — CNN + NLP models auto-assign reports to departments
- **Real-Time Dashboard** — Stats, issue tracking, resolution metrics
- **Admin Panel** — Map view, bulk actions, department analytics
- **Cross-Platform** — Web, iOS, Android via Expo
- **Mock Auth** — Pre-configured credentials for instant testing

---

## 🤝 Contributing

1. Fork → `git checkout -b feature/X` → Commit → Push → PR

---

## 📜 License

MIT
