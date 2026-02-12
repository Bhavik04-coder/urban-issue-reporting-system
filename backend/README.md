UrbanSim AI


AI-Powered System for Smart Urban Issue Redressal

UrbanSim AI is a modern, AI-driven, citizen-centric platform that enables the public to report municipal issues such as road damage, water supply issues, electricity faults, sanitation problems, and more.
The system uses Machine Learning, NLP, and automated department assignment to reduce manual workload and improve response time for urban governance.

This project includes:

✅ Flutter Mobile App (User + Admin)
✅ FastAPI Backend
✅ PostgreSQL Database
✅ JWT Authentication
✅ AI-based Issue Classification
✅ Admin Analytics Dashboard
✅ Docker Deployment
✅ Render Cloud Hosting

🚀 Features
🔹 User Features

Create an account & login securely (JWT-based authentication)

Report issues with:

Title & Description

Images

Voice Note

Location (GPS + Address)

Urgency Level

AI automatically classifies the issue and assigns the correct department

Track report status in real time

View map of submitted issues

User profile & settings

🔹 Admin Features

Fully functional Admin Panel inside the same Flutter app

View all reports with filters (Pending / Resolved / In-Progress)

Monitor city performance with:

Total Issues

Resolved Issues

Pending Issues

Monthly issue trends chart

Department performance analytics

Recent activity feed

Update issue status

Add resolution notes

View user details and timestamps

🔹 AI Features

NLP-based classification of text description

Predicts the relevant department:

Water Department

Electricity Department

Road Department

Sanitation Department

Public Works

Other

Auto-assigns the issue to the department with confidence score

Reduces manual workload for admins

🔹 Backend Features

Built using FastAPI

Asynchronous PostgreSQL database operations using:

SQLAlchemy ORM

AsyncSession

Secure authentication using:

Password hashing (bcrypt)

JWT tokens

REST API with clear endpoints for:

Authentication

Reports

Dashboard analytics

Department statistics

Fully Dockerized

Hosted on Render

🏗️ Tech Stack
Frontend

Flutter (Dart)

Provider / GetX (State management)

Openweather API

Material Design

Backend

FastAPI

Python 3.10+

SQLAlchemy ORM (Async)

PostgreSQL

JWT Authentication

Passlib (bcrypt hashing)

Python-dotenv

DevOps

Docker

Render cloud hosting

Postgres Managed Database

Testing
Test user flow:

✔ Signup → Login → Create Issue → Track Status
✔ Admin Login → Dashboard → Update Status → View Trends
✔ AI auto-assign department
✔ Image(optional) & Text
✔ Location detection

📈 Future Improvements

Add chatbot for instant help

Offline mode for reporting

Push notifications for updates

Integrate SMS gateway

Add AR for visual issue tagging

Better ML model for classification

🤝 Contributors

Atharv Mulik
Siddhi Naik
Vaishnavi Nile
Tejas More
BTech CSE (AI)
AI, Flutter, FastAPI, Cloud Deployment
