# CivicEye — Smart Urban Issue Reporting System

AI-powered civic issue reporting platform built with FastAPI and Flutter. Citizens snap a photo of a problem, the AI identifies the issue type and routes it to the right department automatically.

---

## Quick Start

Run everything with one command (Windows):

```bat
start.bat
```

This will set up the Python virtual environment, install dependencies, seed admin accounts, run database migrations, and launch both the backend and Flutter app in Chrome.

**Manual start:**

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed_admins.py
python seed_dept_admins.py
python add_completed_work_image_column.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Flutter (separate terminal)
cd civic_eye_app
flutter pub get
flutter run -d chrome
```

---

## Login Credentials

### Regular User

| Field    | Value             |
|----------|-------------------|
| Email    | user@example.com  |
| Password | user123           |

### Super Admins

| Email    | admin@example.com |
| Password | Admin@1234        |

### Department Admins

| Department   | Email                    | Password  |
|--------------|--------------------------|-----------|
| Water        | water@urbansim.com       | Dept@1234 |
| Road         | road@urbansim.com        | Dept@1234 |
| Sanitation   | sanitation@urbansim.com  | Dept@1234 |
| Electricity  | electricity@urbansim.com | Dept@1234 |

---

## Features

### For Citizens
- **Smart Report Submission** — Take a photo, AI detects the issue and assigns the right department automatically
- **GPS Location Capture** — One-tap location detection with reverse geocoding
- **Report Tracking** — Follow your report from submission to resolution
- **Completion Photos** — See proof of completed work uploaded by the department
- **Notifications** — Get notified on status changes and when work is completed
- **Edit Own Reports** — Edit title, description, and urgency while the report is still in "Reported" status
- **Delete Own Reports** — Remove reports you submitted
- **Light / Dark Theme** — Toggle in Profile → Settings, preference is saved

### For Department Admins
- **Department-scoped view** — Only see reports assigned to your department
- **Status management** — Move reports through Reported → In Progress → Resolved / Rejected
- **Completed work upload** — Upload a photo proving the work is done when resolving an issue
- **Location details** — Full GPS coordinates and address for every report
- **Search and filter** — By status, priority, title, description, or location
- **Notifications** — Receive alerts for urgent and critical priority reports

### For Super Admins
- **All reports** — View and manage reports across every department
- **Priority control** — Set Normal / High / Critical / Urgent on any report
- **User management** — View users, assign roles, create department admins
- **Analytics dashboard** — Real-time stats, monthly trends, department performance
- **Interactive map** — Color-coded markers for all issues
- **Export** — Download reports as CSV or PDF

### AI Features
- Image recognition model detects: Pothole, Garbage, Water Leakage, Streetlight issues
- Auto-assigns to the correct department
- Auto-generates report title and description
- Shows confidence score for each prediction

---

## Roles & Permissions

| Permission                        | User | Dept Admin | Super Admin |
|-----------------------------------|:----:|:----------:|:-----------:|
| Submit reports                    | ✅   |            |             |
| View own reports                  | ✅   |            |             |
| Edit own reports (title, description, urgency)  | ✅   |            |             |
| Delete own reports                | ✅   |            |             |
| View department reports           |      | ✅         |             |
| Update report status              |      | ✅         | ✅          |
| Upload completed work photo       |      | ✅         | ✅          |
| Change report priority            |      |            | ✅          |
| View all reports                  |      |            | ✅          |
| Manage users / create admins      |      |            | ✅          |
| Export reports                    |      |            | ✅          |

---

## Security

- JWT token authentication (30-day expiry)
- bcrypt / argon2 password hashing
- Account lockout after 5 failed login attempts (15-minute cooldown)
- Role-based access control — department admins are restricted to their own department
- Report ownership validation — users can only delete their own reports
- Image file type validation on upload

**Password requirements:** minimum 8 characters, at least one uppercase, one lowercase, one number, one special character.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | FastAPI, SQLAlchemy (async), SQLite, Uvicorn    |
| Auth       | JWT (python-jose), passlib (argon2/bcrypt)      |
| AI/ML      | TensorFlow (image CNN), scikit-learn (TF-IDF)   |
| Frontend   | Flutter 3, Provider, Material Design 3          |
| Maps       | Google Maps Flutter                             |
| Location   | Geolocator, Geocoding                           |
| Charts     | fl_chart                                        |

---

## Project Structure

```
civic-eye/
├── backend/
│   ├── app/
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # DB engine & session
│   │   └── auth_utils.py      # JWT & password helpers
│   ├── main.py                # FastAPI app & all endpoints
│   ├── image_predict.py       # TensorFlow image classifier
│   ├── predict_text.py        # scikit-learn text classifier
│   ├── civic_eye_model.h5     # Trained image model
│   ├── text_classifier.pkl    # Trained text model
│   ├── seed_admins.py         # Seeds super admin accounts
│   ├── seed_dept_admins.py    # Seeds department admin accounts
│   ├── add_completed_work_image_column.py  # DB migration
│   ├── migrate_db.py          # General DB migrations
│   ├── requirements.txt
│   └── uploads/               # Uploaded images (auto-created)
│
├── civic_eye_app/
│   ├── lib/
│   │   ├── core/
│   │   │   ├── api_service.dart     # All HTTP calls
│   │   │   ├── theme.dart           # App theme (light/dark)
│   │   │   └── notification_service.dart
│   │   ├── models/
│   │   │   ├── report_model.dart
│   │   │   ├── user_model.dart
│   │   │   └── notification_model.dart
│   │   ├── providers/
│   │   │   ├── auth_provider.dart
│   │   │   ├── report_provider.dart
│   │   │   ├── notification_provider.dart
│   │   │   └── theme_provider.dart
│   │   ├── screens/
│   │   │   ├── auth/              # Login, register, forgot password
│   │   │   ├── home/              # Main app shell
│   │   │   ├── report/            # Submit report screen
│   │   │   ├── reports/           # My reports list
│   │   │   ├── admin/             # Admin dashboard, dept admin, map
│   │   │   ├── profile/           # User profile & settings
│   │   │   └── notifications/     # Notification center
│   │   ├── widgets/
│   │   │   ├── report_image_viewer.dart  # Image strip + full-screen viewer
│   │   │   └── notification_bell.dart
│   │   └── main.dart
│   └── pubspec.yaml
│
├── start.bat                  # One-click Windows launcher
├── _run_backend.ps1           # Backend launch script
├── _run_flutter.ps1           # Flutter launch script
└── README.md
```

---

## API Reference

Interactive docs available at **http://localhost:8000/docs** when the backend is running.

### Key Endpoints

```
# Auth
POST  /api/users/register
POST  /api/login
GET   /api/users/me
PUT   /api/users/me

# Reports (user)
POST  /api/reports/smart                          AI report with image
GET   /api/users/reports/filtered                 User's own reports
PATCH /api/users/reports/{id}                     Edit own report (title, description, urgency)
DELETE /api/users/reports/{id}                    Delete own report

# Reports (admin)
GET   /api/admin/reports/all                      All reports (super admin)
PUT   /reports/{id}                               Update status
DELETE /reports/{id}                              Delete any report

# Department admin
GET   /api/dept-admin/reports                     Dept-scoped reports
PATCH /api/dept-admin/reports/{id}/status         Update status
POST  /api/dept-admin/reports/{id}/completed-work-image  Upload proof photo

# Super admin
PATCH /api/super-admin/reports/{id}/priority      Set priority
GET   /api/super-admin/users                      List users
PATCH /api/super-admin/users/{id}/role            Assign role
POST  /api/super-admin/create-admin               Create admin user

# Notifications
GET   /api/notifications
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all

# Analytics
GET   /api/admin/dashboard/stats
GET   /api/admin/map/issues
GET   /api/admin/export/csv
GET   /api/admin/export/pdf
```

---

## Database Migrations

Migrations are run automatically by `start.bat`. To run manually:

```bash
cd backend
python add_completed_work_image_column.py   # adds completed_work_images + priority columns
python migrate_db.py                        # general schema updates
```

---

## Google Maps Setup (Production)

The app uses Google Maps for the admin map view. For production:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and enable Maps SDK for Android/iOS and the Geocoding API.
2. Create an API key.

**Android** — `civic_eye_app/android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE"/>
```

**iOS** — `civic_eye_app/ios/Runner/AppDelegate.swift`:
```swift
GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
```

---

## Troubleshooting

**Location not working on web** — Click the location icon in the Chrome address bar and allow access.

**Map shows blank** — Add a Google Maps API key (see above) and rebuild the app.

**Backend won't start** — Check if port 8000 is already in use:
```bash
netstat -ano | findstr :8000
```

**Flutter build errors:**
```bash
cd civic_eye_app
flutter clean
flutter pub get
flutter run
```

**Database errors:**
```bash
cd backend
python add_completed_work_image_column.py
python migrate_db.py
```

---

## Deployment

**Backend** — Set `SECRET_KEY` and `DATABASE_URL` environment variables, switch to PostgreSQL for production, enable HTTPS, configure CORS for your domain.

**Flutter Web:**
```bash
flutter build web
# Deploy the build/web folder to Firebase Hosting, Netlify, etc.
```

**Flutter Android / iOS:**
```bash
flutter build apk --release
flutter build appbundle --release
flutter build ios --release
```

---

## Future Enhancements

- Push notifications via FCM
- Offline mode with background sync
- Multi-language support
- Two-factor authentication
- Password reset via email
- Before/after photo comparison for completed work
- Citizen rating of completed work quality
- Real-time chat between citizens and admins
- Advanced analytics and reporting

---

*Version 2.0 — April 2026*  
*CivicEye — Making Cities Better Together*
