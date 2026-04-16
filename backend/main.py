from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File, Form,Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator
import re
import random
import json
from jose import JWTError, jwt
from datetime import datetime, timedelta, date
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
import math
from sqlalchemy.orm import selectinload
import asyncio
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas, database
from sqlalchemy.future import select
from dateutil.relativedelta import relativedelta
from app.schemas import UserProfileResponse,UserProfileUpdate

import numpy as np
from image_predict import original_class_labels,model
from predict_text import predict_department_from_text

from app import models
from app.database import get_db, engine, AsyncSessionLocal
from app.models import Report, User, Category, Status
from app.schemas import UserCreate, UserResponse, UserLogin,MapStatsResponse,MapIssuesResponse,MapIssueResponse  
from app.auth_utils import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM    

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

from predict_text import predict_department_from_text
from image_predict import predict_image, preprocess_image

class UserCreateEnhanced(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    mobile_number: str
    is_admin: bool = False

    @field_validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        # Check for uppercase letter
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        # Check for lowercase letter
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        # Check for digit
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        
        # Check for special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]', v):
            raise ValueError('Password must contain at least one special character (!@#$%^&*...)')
        
        return v

    @field_validator('full_name')
    def validate_full_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Full name cannot be empty')
        if len(v) < 2:
            raise ValueError('Full name must be at least 2 characters long')
        if not re.match(r'^[a-zA-Z\s_]+$', v):
            raise ValueError('Full name can only contain letters, spaces and underscores')
        return v.strip()

    @field_validator('mobile_number')
    def validate_mobile_number(cls, v):
        if not re.match(r'^\d{10}$', v):
            raise ValueError('Mobile number must be exactly 10 digits')
        return v

class UserLoginEnhanced(BaseModel):
    email: EmailStr
    password: str
    is_admin: bool = False

class ReportCreate(BaseModel):
    # User Information
    user_name: str
    user_mobile: str
    user_email: Optional[str] = None
    
    # Issue Information
    urgency_level: str
    title: str
    description: str
    
    # Location Information
    location_lat: float
    location_long: float
    location_address: Optional[str] = None
    
    # ✅ ADD THESE FIELDS FOR AI ASSIGNMENT
    department: Optional[str] = "other"  # Will be set by AI prediction
    auto_assigned: Optional[bool] = False
    prediction_confidence: Optional[float] = None
    
    # Validation
    @field_validator('user_name')
    def validate_user_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Full name cannot be empty')
        if len(v) < 2:
            raise ValueError('Full name must be at least 2 characters long')
        return v.strip()

    @field_validator('user_mobile')
    def validate_user_mobile(cls, v):
        if not re.match(r'^\d{10}$', v):
            raise ValueError('Mobile number must be exactly 10 digits')
        return v

    @field_validator('urgency_level')
    def validate_urgency_level(cls, v):
        valid_urgency_levels = ["High", "Medium", "Low"]
        if v not in valid_urgency_levels:
            raise ValueError(f'Urgency level must be one of: {", ".join(valid_urgency_levels)}')
        return v

    @field_validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        if len(v) < 5:
            raise ValueError('Title must be at least 5 characters long')
        return v.strip()

    @field_validator('description')
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValueError('Description cannot be empty')
        if len(v) < 10:
            raise ValueError('Description must be at least 10 characters long')
        return v.strip()

    @field_validator('location_lat')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @field_validator('location_long')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v

    @field_validator('department')
    def validate_department(cls, v):
        valid_depts = ["water_dept", "road_dept", "sanitation_dept", "electricity_dept", "other"]
        if v and v not in valid_depts:
            raise ValueError(f'Department must be one of: {", ".join(valid_depts)}')
        return v if v else "other"

app = FastAPI(title="Smart Urban Issue Redressal API", version="0.1.0")

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
    expose_headers=["*"],  
)

# Add this function to verify tokens
MOCK_USERS = {
    "admin@example.com": {
        "id": 999,
        "email": "admin@example.com",
        "full_name": "Mock Admin",
        "mobile_number": "0000000000",
        "is_admin": True,
        "password": "admin123",
        "created_at": datetime.utcnow()
    },
    "user@example.com": {
        "id": 888,
        "email": "user@example.com",
        "full_name": "Mock User",
        "mobile_number": "1111111111",
        "is_admin": False,
        "password": "user123",
        "created_at": datetime.utcnow()
    }
}

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        is_admin: bool = payload.get("is_admin")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Check mock users first
    if email in MOCK_USERS:
        mock_data = MOCK_USERS[email]
        # Create a mock objects that mimics the User model
        class MockUser:
            def __init__(self, data):
                for k, v in data.items():
                    setattr(self, k, v)
        return MockUser(mock_data)

    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

# Add this function to check if user is admin
async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to perform this action"
        )
    return current_user

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Smart Urban Issue Redressal API"}

@app.post("/init-db")
async def initialize_database(db: AsyncSession = Depends(get_db)):
    try:
        # Create default categories if they don't exist
        categories = [
            Category(name="Infrastructure", description="Roads, bridges, public facilities"),
            Category(name="Sanitation", description="Waste management, cleanliness"),
            Category(name="Public Safety", description="Safety and security issues"),
            Category(name="Utilities", description="Water, electricity, gas services"),
            Category(name="Environment", description="Parks, pollution, green spaces"),
        ]
        
        for category in categories:
            result = await db.execute(select(Category).filter(Category.name == category.name))
            existing_category = result.scalar_one_or_none()
            if not existing_category:
                db.add(category)
        
        # Create default statuses
        statuses = [
            Status(name="Reported", description="Issue has been reported"),
            Status(name="In Progress", description="Issue is being addressed"),
            Status(name="Resolved", description="Issue has been resolved"),
            Status(name="Closed", description="Issue has been closed"),
        ]
        
        for status in statuses:
            result = await db.execute(select(Status).filter(Status.name == status.name))
            existing_status = result.scalar_one_or_none()
            if not existing_status:
                db.add(status)
        
        # Create default admin user
        result = await db.execute(select(User).filter(User.email == "admin@urbanissues.com"))
        admin_user_exists = result.scalar_one_or_none()
        if not admin_user_exists:
            admin_user = User(
                email="admin@urbanissues.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrator",
                mobile_number="1234567890",
                is_admin=True
            )
            db.add(admin_user)
        
        await db.commit()
        
        return {"message": "Database initialized successfully!", "admin_credentials": {"email": "admin@urbanissues.com", "password": "admin123"}}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing database: {str(e)}"
        )

# Add these hardcoded admin emails to your seed data
HARDCODED_ADMIN_EMAILS = [
    'atharv@urbansim.com',
    'siddhi@urbansim.com',
    'admin@example.com',
]

ADMIN_PROFILES = {
    "atharv@urbansim.com": {
        "name": "Atharv Mulik",
        "email": "atharv@urbansim.com",
        "contact": "+91 9876543210",
        "admin_id": "ADM-2024-001"
    },
    "siddhi@urbansim.com": {
        "name": "Siddhi Naik",
        "email": "siddhi@urbansim.com",
        "contact": "+91 9123456780",
        "admin_id": "ADM-2024-002"
    },
    "admin@example.com": {
        "name": "Mock Administrator",
        "email": "admin@example.com",
        "contact": "+00 0000000000",
        "admin_id": "ADM-MOCK-001"
    }
}
@app.get("/api/admin/profile")
async def get_admin_profile(email: str):
    if email not in ADMIN_PROFILES:
        raise HTTPException(status_code=403, detail="Not an admin")

    return ADMIN_PROFILES[email]


@app.post("/init-admins")
async def initialize_admin_users(db: AsyncSession = Depends(get_db)):
    """
    Initialize hardcoded admin users (run once)
    """
    try:
        admins_created = []
        
        for i, email in enumerate(HARDCODED_ADMIN_EMAILS):
            # Check if admin already exists
            result = await db.execute(select(User).filter(User.email == email))
            existing_admin = result.scalar_one_or_none()
            
            if not existing_admin:
                admin_user = User(
                    email=email,
                    hashed_password=get_password_hash("admin123"),  
                    full_name=f"Admin User {i+1}",
                    mobile_number=f"98765432{i:02d}",
                    is_admin=True
                )
                db.add(admin_user)
                admins_created.append(email)
        
        await db.commit()
        
        return {
            "message": "Admin users initialized",
            "admins_created": admins_created,
            "total_admins": len(HARDCODED_ADMIN_EMAILS),
            "default_password": "admin123"
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing admin users: {str(e)}"
        )

@app.get("/reports/", response_model=List[dict])
async def read_reports(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Report).order_by(Report.created_at.desc()).offset(skip).limit(limit))
    reports = result.scalars().all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "urgency_level": r.urgency_level,
            "status": r.status or "Reported",
            "department": r.department or "other",
            "location_lat": r.location_lat,
            "location_long": r.location_long,
            "location_address": r.location_address,
            "ai_label": r.ai_label if hasattr(r, 'ai_label') else None,
            "prediction_confidence": r.prediction_confidence,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            "user_name": r.user_name,
            "user_mobile": r.user_mobile,
            "user_email": r.user_email,
        }
        for r in reports
    ]

@app.post("/api/reports/")
async def create_report(
    report_data: ReportCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1️⃣ Fetch or auto-create "Reported" status so the endpoint never hard-fails
        status_result = await db.execute(
            select(Status).where(Status.name == "Reported")
        )
        reported_status = status_result.scalar_one_or_none()

        if not reported_status:
            reported_status = Status(name="Reported", description="Issue has been reported")
            db.add(reported_status)
            await db.flush()  # get the id without committing

        # 2️⃣ Create report
        db_report = Report(
            user_name=report_data.user_name,
            user_mobile=report_data.user_mobile,
            user_email=report_data.user_email,
            urgency_level=report_data.urgency_level,
            title=report_data.title,
            description=report_data.description,
            issue_type="General",
            category="General",
            location_lat=report_data.location_lat,
            location_long=report_data.location_long,
            location_address=report_data.location_address,
            status="Reported",
            status_id=reported_status.id,
            department=report_data.department or "other",
            auto_assigned=report_data.auto_assigned or False,
            prediction_confidence=report_data.prediction_confidence
        )

        db.add(db_report)
        await db.commit()
        await db.refresh(db_report)

        return {
            "message": "Report created successfully",
            "report_id": db_report.id
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports/{report_id}")
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Report).filter(Report.id == report_id))
    db_report = result.scalar_one_or_none()
    
    if db_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    return {
        "id": db_report.id,
        "title": db_report.title,
        "description": db_report.description,
        "urgency_level": db_report.urgency_level,
        "status": db_report.status or "Reported",
        "department": db_report.department or "other",
        "location_lat": db_report.location_lat,
        "location_long": db_report.location_long,
        "location_address": db_report.location_address,
        "prediction_confidence": db_report.prediction_confidence,
        "created_at": db_report.created_at.isoformat() if db_report.created_at else None,
        "updated_at": db_report.updated_at.isoformat() if db_report.updated_at else None,
        "user_name": db_report.user_name,
        "user_mobile": db_report.user_mobile,
        "user_email": db_report.user_email,
    }

@app.put("/reports/{report_id}")
async def update_report_status(
    report_id: int,
    new_status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Fetch the report
    report_result = await db.execute(select(Report).filter(Report.id == report_id))
    db_report = report_result.scalar_one_or_none()

    if db_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )

    # Look up the status row — use a different variable name to avoid shadowing
    # the imported `status` module from fastapi
    status_result = await db.execute(select(Status).filter(Status.name == new_status))
    status_row = status_result.scalar_one_or_none()

    if status_row is None:
        # Status not in DB — still update the string field so the UI reflects it
        db_report.status = new_status
    else:
        db_report.status_id = status_row.id
        db_report.status = new_status

    await db.commit()
    await db.refresh(db_report)

    return {
        "message": f"Report {report_id} status updated to {new_status}",
        "report_id": db_report.id,
        "status": db_report.status,
    }

@app.delete("/reports/{report_id}")
async def delete_report(
    report_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    result = await db.execute(select(Report).filter(Report.id == report_id))
    db_report = result.scalar_one_or_none()
    
    if db_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    await db.delete(db_report)
    await db.commit()
    
    return {"message": f"Report with ID {report_id} has been successfully deleted."}

# ✅ UPDATED: Get urgency levels instead of issue types
@app.get("/urgency-levels")
async def get_urgency_levels():
    urgency_levels = ["High", "Medium", "Low"]
    return {"urgency_levels": urgency_levels}

@app.post("/api/users/register", response_model=UserResponse)
async def signup(user_data: UserCreateEnhanced, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if mobile number already exists
    result = await db.execute(select(User).filter(User.mobile_number == user_data.mobile_number))
    existing_mobile = result.scalar_one_or_none()
    if existing_mobile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered"
        )
    
    # Prevent self-assigning admin role
    if user_data.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot self-assign admin role during signup"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        mobile_number=user_data.mobile_number,
        is_admin=False
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@app.post("/api/login")
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # Check mock users first
    if login_data.email in MOCK_USERS:
        mock_user = MOCK_USERS[login_data.email]
        if login_data.password == mock_user["password"]:
            access_token = create_access_token(
                data={
                    "sub": mock_user["email"],
                    "is_admin": mock_user["is_admin"]
                }
            )
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": mock_user["id"],
                "is_admin": mock_user["is_admin"],
                "full_name": mock_user["full_name"],
                "email": mock_user["email"],
                "message": "Login successful (Mock Mode)"
            }

    result = await db.execute(
        select(User).filter(User.email == login_data.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": user.email,
            "is_admin": user.is_admin
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "is_admin": user.is_admin,
        "full_name": user.full_name,
        "email": user.email,
        "message": "Login successful"
    }

@app.get("/api/users/me", response_model=UserProfileResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
@app.put("/api/users/me", response_model=UserProfileResponse)
async def update_users_me(
    profile_data: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return current_user


# Get current user's reports
@app.get("/users/me/reports")
async def read_own_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Report).filter(Report.user_id == current_user.id))
    user_reports = result.scalars().all()
    return user_reports

# Get all categories
@app.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    return categories

# Get all statuses
@app.get("/statuses")
async def get_statuses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Status))
    statuses = result.scalars().all()
    return statuses



# some extra end points

@app.get("/dashboard/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    
    try:
        # Get total reports in system
        total_reports_result = await db.execute(select(func.count(Report.id)))
        total_reports_count = total_reports_result.scalar()

        # Get today's resolved issues count
        today = date.today()
        today_resolved_result = await db.execute(
            select(func.count(Report.id))
            .join(Status)
            .filter(Status.name == "Resolved")
            .filter(func.date(Report.updated_at) == today)
        )
        today_resolved_count = today_resolved_result.scalar()

        # Get recent reports (public)
        recent_reports_result = await db.execute(
            select(Report)
            .order_by(Report.created_at.desc())
            .limit(5)
        )
        recent_reports = recent_reports_result.scalars().all()

        return {
            "message": "Welcome to UrbanSim AI - Make your city better today",
            "public_stats": {
                "total_reports": total_reports_count,
                "today_resolved": today_resolved_count,
                "active_issues": total_reports_count - today_resolved_count
            },
            "recent_reports": recent_reports
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard summary: {str(e)}"
        )


@app.get("/reports/resolved/today")
async def get_todays_resolved_issues(db: AsyncSession = Depends(get_db)):
    
    try:
        today = date.today()
        
        # Get resolved reports from today
        result = await db.execute(
            select(Report)
            .join(Status)
            .filter(Status.name == "Resolved")
            .filter(func.date(Report.updated_at) == today)
        )
        resolved_reports = result.scalars().all()
        
        # Format response data
        formatted_reports = []
        for report in resolved_reports:
            report_data = {
                "id": report.id,
                "title": report.title,
                "description": report.description,
                "urgency_level": report.issue_type,
                "category": report.category.name if report.category else "General",
                "location_address": report.location_address,
                "resolved_at": report.updated_at
            }
            formatted_reports.append(report_data)
        
        # Get count by category
        category_count_result = await db.execute(
            select(Category.name, func.count(Report.id))
            .select_from(Report)
            .join(Category)
            .join(Status)
            .filter(Status.name == "Resolved")
            .filter(func.date(Report.updated_at) == today)
            .group_by(Category.name)
        )
        category_counts = category_count_result.all()
        
        return {
            "date": today.isoformat(),
            "total_resolved_today": len(resolved_reports),
            "resolved_issues": formatted_reports,
            "category_breakdown": [{"category": cat, "count": cnt} for cat, cnt in category_counts]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching today's resolved issues: {str(e)}"
        )

@app.get("/api/activity/today")
async def get_todays_activity(db: AsyncSession = Depends(get_db)):
    """
    Returns today's public activity feed (no auth required)
    """
    today = date.today()
    activities = []

    # 1️⃣ New reports created today
    new_reports_result = await db.execute(
        select(Report)
        .where(func.date(Report.created_at) == today)
        .order_by(Report.created_at.desc())
        .limit(10)
    )
    new_reports = new_reports_result.scalars().all()

    for report in new_reports:
        activities.append({
            "type": "new_report",
            "title": f"New {report.issue_type} issue reported",
            "description": report.title,
            "urgency": report.urgency_level,
            "category": report.category or "General",
            "timestamp": report.created_at,
            "location": report.location_address
        })

    # 2️⃣ Issues resolved today
    resolved_reports_result = await db.execute(
        select(Report)
        .join(Status, Status.id == Report.status_id)
        .where(
            Status.name == "Resolved",
            func.date(Report.updated_at) == today
        )
        .order_by(Report.updated_at.desc())
        .limit(10)
    )
    resolved_reports = resolved_reports_result.scalars().all()

    for report in resolved_reports:
        activities.append({
            "type": "issue_resolved",
            "title": f"{report.issue_type} issue resolved",
            "description": f"'{report.title}' has been fixed",
            "category": report.category or "General",
            "timestamp": report.updated_at,
            "location": report.location_address
        })

    # 3️⃣ Sort by time (latest first)
    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "date": today.isoformat(),
        "total_activities": len(activities),
        "activities": activities[:15]
    }


@app.get("/reports/{report_id}/confirmations")
async def get_issue_confirmations(
    report_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get confirmation count for an issue (public - no auth required)
    """
    try:
        report_result = await db.execute(select(Report).filter(Report.id == report_id))
        report = report_result.scalar_one_or_none()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID {report_id} not found"
            )
        
        confirmation_count = getattr(report, 'confirmation_count', 0)
        
        return {
            "report_id": report_id,
            "title": report.title,
            "confirmation_count": confirmation_count,
            "confirmed_by_citizens": confirmation_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching confirmations: {str(e)}"
        )

@app.get("/dashboard/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Returns public dashboard statistics (no auth required)
    """
    try:
        # Total reports count
        total_reports_result = await db.execute(select(func.count(Report.id)))
        total_reports = total_reports_result.scalar()
        
        # Resolved reports count
        resolved_reports_result = await db.execute(
            select(func.count(Report.id))
            .join(Status)
            .filter(Status.name == "Resolved")
        )
        resolved_reports = resolved_reports_result.scalar()
        
        # In progress reports count
        in_progress_result = await db.execute(
            select(func.count(Report.id))
            .join(Status)
            .filter(Status.name == "In Progress")
        )
        in_progress_reports = in_progress_result.scalar()
        
        # Category-wise counts
        category_stats_result = await db.execute(
            select(Category.name, func.count(Report.id))
            .select_from(Report)
            .join(Category)
            .group_by(Category.name)
        )
        category_stats = category_stats_result.all()
        
        # Urgency level counts
        urgency_stats_result = await db.execute(
            select(Report.issue_type, func.count(Report.id))
            .group_by(Report.issue_type)
        )
        urgency_stats = urgency_stats_result.all()
        
        return {
            "total_reports": total_reports,
            "resolved_reports": resolved_reports,
            "in_progress_reports": in_progress_reports,
            "resolution_rate": round((resolved_reports / total_reports * 100) if total_reports > 0 else 0, 1),
            "category_stats": [{"category": cat, "count": cnt} for cat, cnt in category_stats],
            "urgency_stats": [{"urgency": urg, "count": cnt} for urg, cnt in urgency_stats]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )

@app.get("/reports/category-summary")
async def get_category_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns count of issues per category (public - no auth required)
    """
    try:
        result = await db.execute(
            select(Category.name, Category.description, func.count(Report.id))
            .select_from(Report)
            .join(Category)
            .group_by(Category.name, Category.description)
        )
        category_summary = result.all()
        
        return {
            "category_summary": [
                {
                    "category_name": name,
                    "description": desc,
                    "issue_count": count
                }
                for name, desc, count in category_summary
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching category summary: {str(e)}"
        )
    
@app.get("/api/users/reports/filtered")
async def get_user_reports_filtered(
    status_filter: str = Query("all"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_email = current_user.email
    try:
        print(f"🔍 Fetching reports for user: {user_email}, filter: {status_filter}")
        
        result = await db.execute(
            select(Report)
            .filter(Report.user_email == user_email)
            .order_by(Report.created_at.desc())
        )
        reports = result.scalars().all()
        print(f"✅ Found {len(reports)} reports for user {user_email}")

        formatted = []
        for r in reports:
            # category
            category = None
            if r.category_id:
                cat_res = await db.execute(select(Category).filter(Category.id == r.category_id))
                category = cat_res.scalar_one_or_none()

            # status
            status_obj = None
            if r.status_id:
                stat_res = await db.execute(select(Status).filter(Status.id == r.status_id))
                status_obj = stat_res.scalar_one_or_none()

            # filtering
            should_include = True
            status_name = status_obj.name if status_obj else "Reported"

            if status_filter == "active" and status_name not in ["Reported", "In Progress"]:
                should_include = False
            elif status_filter == "resolved" and status_name != "Resolved":
                should_include = False

            if should_include:
                formatted.append({
                    "id": r.id,
                    "complaint_id": f"#{r.id:05d}",
                    "title": r.title,
                    "description": r.description,
                    "date": r.created_at.strftime("%d %b. %I:%M %p") if r.created_at else None,
                    "category": category.name if category else "General",
                    "status": status_name,
                    "urgency_level": r.urgency_level,
                    "location_address": r.location_address,
                    "user_name": r.user_name,
                    "user_email": r.user_email
                })

        return {
            "total_complaints": len(formatted),
            "filter": status_filter,
            "user_email": user_email,
            "complaints": formatted
        }

    except Exception as e:
        import traceback
        print(f"❌ Error: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user reports: {str(e)}"
        )


@app.get("/users/reports/search")
async def search_user_reports(
    query: str = Query(..., description="Search by complaint ID or text"),
    user_email: str = Query(..., description="User email to search reports"),  # CHANGED BACK: Made mandatory
    db: AsyncSession = Depends(get_db)
):
    """
    Search user's reports by complaint ID or text
    For search functionality in "My Complaints" page - Public access
    """
    try:
        print(f"🔍 Searching reports for user: {user_email}, query: {query}")
        
        # Check if query is a complaint ID (format: #12345 or 12345)
        complaint_id = None
        if query.startswith('#'):
            try:
                complaint_id = int(query[1:])
            except ValueError:
                complaint_id = None
        else:
            try:
                complaint_id = int(query)
            except ValueError:
                complaint_id = None
        
        # Base query - user can only see their own reports
        base_query = select(Report).filter(Report.user_email == user_email)
        
        if complaint_id:
            # Search by exact ID
            base_query = base_query.filter(Report.id == complaint_id)
        else:
            # Search by title or description
            search_term = f"%{query}%"
            base_query = base_query.filter(
                Report.title.ilike(search_term) | 
                Report.description.ilike(search_term)
            )
        
        base_query = base_query.order_by(Report.created_at.desc())
        
        result = await db.execute(base_query)
        search_results = result.scalars().all()
        
        print(f"✅ Found {len(search_results)} search results")
        
        formatted_results = []
        for report in search_results:
            # Get category and status for each report
            category_result = await db.execute(
                select(Category).filter(Category.id == report.category_id)
            )
            category = category_result.scalar_one_or_none()
            
            status_result = await db.execute(
                select(Status).filter(Status.id == report.status_id)
            )
            status = status_result.scalar_one_or_none()
            
            report_data = {
                "id": report.id,
                "complaint_id": f"#{report.id:05d}",
                "title": report.title,
                "description": report.description,
                "date": report.created_at.strftime("%d %b. %I:%M %p"),
                "category": category.name if category else "General",
                "status": status.name if status else "Reported",
                "location_address": report.location_address,
                "user_name": report.user_name,
                "user_email": report.user_email
            }
            formatted_results.append(report_data)
        
        return {
            "search_query": query,
            "user_email": user_email,
            "results_count": len(formatted_results),
            "complaints": formatted_results
        }
        
    except Exception as e:
        print(f"❌ Error in search endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching reports: {str(e)}"
        )

@app.get("/api/reports/{report_id}/timeline")
async def get_report_timeline(
    report_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns detailed report information with timeline
    """
    try:
        print(f"🔍 Fetching timeline for report ID: {report_id}")
        
        # Get report
        report_result = await db.execute(
            select(Report).filter(Report.id == report_id)
        )
        report = report_result.scalar_one_or_none()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID {report_id} not found"
            )
        
        print(f"✅ Found report: {report.title}")
        
        # Get category
        category = None
        if report.category_id:
            category_result = await db.execute(
                select(Category).filter(Category.id == report.category_id)
            )
            category = category_result.scalar_one_or_none()
        
        # Get status - FIXED: renamed variable to avoid conflict
        report_status = None
        if report.status_id:
            status_result = await db.execute(
                select(Status).filter(Status.id == report.status_id)
            )
            report_status = status_result.scalar_one_or_none()
        
        print(f"📊 Category: {category.name if category else 'None'}")
        print(f"📊 Status: {report_status.name if report_status else 'None'}")
        
        # ✅ FIX: Handle None dates safely
        created_at = report.created_at if report.created_at else datetime.utcnow()
        updated_at = report.updated_at if report.updated_at else created_at
        
        # Build timeline events
        timeline_events = []
        
        # Event 1: Complaint Submitted
        timeline_events.append({
            "event": "Submitted",
            "description": "Complaint submitted",
            "timestamp": created_at.isoformat(),
            "status": "completed"
        })
        
        # Event 2: Assigned to Department
        if report_status and report_status.name in ["In Progress", "Resolved", "Closed"]:
            timeline_events.append({
                "event": "Assigned",
                "description": "Assigned to department",
                "timestamp": (created_at + timedelta(hours=2)).isoformat(),
                "status": "completed"
            })

        
        # Event 3: Work in Progress
        if report_status and report_status.name in ["In Progress", "Resolved", "Closed"]:
            timeline_events.append({
                "event": "In Progress",
                "description": "Work in progress",
                "timestamp": (created_at + timedelta(hours=4)).isoformat(),
                "status": "completed" if report_status.name in ["Resolved", "Closed"] else "in_progress"
            })

        
        if report_status and report_status.name == "Resolved":
            timeline_events.append({
                "event": "Resolved",
                "description": "Issue resolved successfully",
                "timestamp": updated_at.isoformat(),
                "status": "completed"
            })

        
        # Sort timeline by timestamp
        timeline_events.sort(key=lambda x: x["timestamp"])
        
        # Prepare response data
        response_data = {
            "complaint_details": {
                "id": report.id,
                "complaint_id": f"#{report.id:05d}",
                "title": report.title or "No Title",
                "description": report.description or "No description",
                "submitted_on": created_at.strftime("%d %b. %I:%M %p"),
                "category": category.name if category else "General",
                "department": "Public Works Department",
                "urgency_level": report.urgency_level or "medium",
                "status": report_status.name if report_status else "submitted",
                "location_address": report.location_address,
                "location_lat": report.location_lat,
                "location_long": report.location_long,
                "user_name": report.user_name,
                "user_email": report.user_email
            },
            "timeline": timeline_events,
            "confirmation_count": getattr(report, 'confirmation_count', 0)
        }
        
        print(f"✅ Successfully built timeline with {len(timeline_events)} events")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in timeline endpoint: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching report timeline: {str(e)}"
        )

# admin endpoints


@app.get("/api/admin/issues")
async def get_admin_issues(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Report))
        issues = result.scalars().all()

        issues_list = []
        for issue in issues:
            if issue.location_lat is None or issue.location_long is None:
                continue

            issues_list.append({
                "id": issue.id,
                "user_name": issue.user_name,
                "user_email": issue.user_email,
                "title": issue.title,
                "description": issue.description,
                "urgency_level": issue.urgency_level,
                "status": issue.status,
                "location_address": issue.location_address,

                # ✅ REQUIRED FOR MAP
                "location_lat": issue.location_lat,
                "location_long": issue.location_long,

                "assigned_department": issue.assigned_department,
                "created_at": issue.created_at.isoformat() if issue.created_at else None,
            })

        return {"issues": issues_list}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. Get Single Report Details
@app.get("/api/admin/issues/{report_id}", response_model=schemas.ReportResponse)
async def get_issue_details(report_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(models.Report).where(models.Report.id == report_id)
        )
        report = result.scalar_one_or_none()
        if not report:
            raise HTTPException(status_code=404, detail="Issue not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 3. Update Report Status - CORRECTED FOR STRING STATUS
@app.patch("/api/admin/issues/{report_id}/status")
async def update_issue_status(
    report_id: int,
    status_update: schemas.StatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1️⃣ Fetch report
        result = await db.execute(
            select(models.Report).where(models.Report.id == report_id)
        )
        report = result.scalar_one_or_none()

        if not report:
            raise HTTPException(status_code=404, detail="Issue not found")

        # 2️⃣ Fetch Status row using provided name
        status_result = await db.execute(
            select(models.Status).where(models.Status.name == status_update.status)
        )
        new_status = status_result.scalar_one_or_none()

        if not new_status:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{status_update.status}'"
            )

        # 3️⃣ Update BOTH fields (CRITICAL FIX)
        report.status_id = new_status.id            # ✅ used everywhere
        report.status = new_status.name             # ⚠️ optional

        report.updated_at = datetime.utcnow()

        # 4️⃣ Save
        await db.commit()
        await db.refresh(report)

        return {
            "message": "Status updated successfully",
            "report_id": report.id,
            "status": new_status.name
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

# 5. Delete Report - CORRECTED (no changes needed here)
@app.delete("/api/admin/issues/{report_id}")
async def delete_issue(report_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(models.Report).where(models.Report.id == report_id)
        )
        report = result.scalar_one_or_none()
        
        if not report:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        await db.delete(report)
        await db.commit()
        
        return {"message": "Issue deleted successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 6. Verify & Resolve Report - CORRECTED FOR STRING STATUS
@app.post("/api/admin/issues/{report_id}/resolve")
async def resolve_issue(
    report_id: int,
    resolve_data: schemas.ResolveIssue,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1️⃣ Fetch report
        result = await db.execute(
            select(models.Report).where(models.Report.id == report_id)
        )
        report = result.scalar_one_or_none()

        if not report:
            raise HTTPException(status_code=404, detail="Issue not found")

        # 2️⃣ Fetch "Resolved" status row (IMPORTANT)
        status_result = await db.execute(
            select(models.Status).where(models.Status.name == "Resolved")
        )
        resolved_status = status_result.scalar_one_or_none()

        if not resolved_status:
            raise HTTPException(
                status_code=500,
                detail="Resolved status not found in Status table"
            )

        # 3️⃣ Update BOTH status fields (CRITICAL FIX)
        report.status_id = resolved_status.id      # ✅ Source of truth
        report.status = "Resolved"                 # ⚠️ optional (legacy support)

        # 4️⃣ Other fields
        report.resolution_notes = resolve_data.resolution_notes
        report.resolved_by = resolve_data.resolved_by
        report.updated_at = datetime.utcnow()

        # 5️⃣ Save
        await db.commit()
        await db.refresh(report)

        return {
            "message": "Issue resolved successfully",
            "report_id": report.id,
            "status": "Resolved"
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


# 7. Get All Departments - CORRECTED (no changes needed here)
@app.get("/api/admin/departments")
async def get_departments():
    departments = [
        {"id": 1, "name": "Public Works", "email": "publicworks@city.gov", "phone": "+1-555-0101", "head": "John Smith"},
        {"id": 2, "name": "Water Dept", "email": "waterdept@city.gov", "phone": "+1-555-0102", "head": "Sarah Johnson"},
        {"id": 3, "name": "Road Dept", "email": "roaddept@city.gov", "phone": "+1-555-0103", "head": "Mike Brown"},
        {"id": 4, "name": "Sanitation Dept", "email": "sanitation@city.gov", "phone": "+1-555-0104", "head": "Lisa Davis"},
        {"id": 5, "name": "Other", "email": "other@city.gov", "phone": "+1-555-0105", "head": "Admin"}
    ]
    return departments





# Department Analysis Endpoints

def get_department_icon(dept_name: str) -> str:
    icon_mapping = {
    "Water Dept": "water-drop",
    "Road Dept": "road",
    "Sanitation Dept": "clean-hands",
    "Electricity Dept": "flash-on",
    "Public Works": "engineering"
}
    return icon_mapping.get(dept_name, "build")

def get_category_from_department(dept_name: str) -> str:
    category_mapping = {
        "Water Dept": "Utilities",
        "Road Dept": "Infrastructure",
        "Sanitation Dept": "Sanitation", 
        "Electricity Dept": "Environment",
        "Public Works": "Public Safety"
    }
    return category_mapping.get(dept_name, "General")

def generate_trend_data(current_efficiency: float) -> List[float]:
    """Generate realistic trend data based on current efficiency"""
    base = max(50, current_efficiency - 20)
    return [
        round(base, 1),
        round(base + 5, 1),
        round(base + 10, 1), 
        round(base + 15, 1),
        round(base + 18, 1),
        round(current_efficiency, 1)
    ]

def generate_efficiency_trend(dept_id: int) -> List[float]:
    """Generate efficiency trend for a department"""
    trends = {
        1: [65, 72, 78, 82, 85, 88.3],
        2: [70, 75, 80, 85, 90, 92.5],
        3: [60, 62, 65, 68, 70, 72.8],
        4: [75, 78, 80, 83, 86, 88.3]
    }
    return trends.get(dept_id, [70, 75, 78, 80, 82, 85])

class DepartmentFeedbackRequest(BaseModel):
    department_id: int
    feedback_text: str
    rating: Optional[int] = None

class StatusUpdateRequest(BaseModel):
    department_id: int
    issue_ids: List[int]
    new_status: str

class ResolveIssuesRequest(BaseModel):
    department_id: int
    issue_ids: List[int]
    resolution_notes: str



@app.get("/api/departments/summary")
async def get_departments_summary(
    period: str = Query("month", description="Time period: week, month, year"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get summary for all departments with REAL DATA from database
    """
    try:
        # ✅ FIXED: Use actual department field from Report model
        # Map database department values to display names
        department_display_names = {
            "water_dept": "Water Dept",
            "road_dept": "Road Dept",
            "sanitation_dept": "Sanitation Dept",
            "electricity_dept": "Electricity Dept",
            "other": "Other"
        }
        
        departments_data = []
        
        # Query each department's real data
        for dept_key, dept_name in department_display_names.items():
            # Get total issues for this department
            total_result = await db.execute(
                select(func.count(Report.id))
                .where(Report.department == dept_key)
            )
            total_issues = total_result.scalar() or 0
            
            # Get status counts for this department
            status_result = await db.execute(
                select(Report.status, func.count(Report.id))
                .where(Report.department == dept_key)
                .group_by(Report.status)
            )
            status_counts = dict(status_result.all())
            
            resolved = status_counts.get("Resolved", 0)
            pending = status_counts.get("Pending", 0)
            progress = status_counts.get("In Progress", 0)
            
            # Calculate efficiency
            efficiency = round((resolved / total_issues * 100) if total_issues > 0 else 0, 1)
            
            # Only add departments that have issues
            if total_issues > 0:
                departments_data.append({
    "id": len(departments_data) + 1,
    "name": dept_name,
    "internal_name": dept_key,          # ✅ ADD
    "icon": get_department_icon(dept_name),  # must match frontend
    "resolved": resolved,
    "pending": pending,
    "progress": progress,
    "efficiency": efficiency,
    "total_issues": total_issues
})

        
        print(f"✅ Fetched real data for {len(departments_data)} departments")
        
        return {
            "departments": departments_data,
            "period": period,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error fetching department summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching department summary: {str(e)}"
        )
    
from sqlalchemy import text

@app.get("/api/departments/resolution-trends")
async def get_resolution_trends(
    months: int = Query(6, ge=1, le=12),
    db: AsyncSession = Depends(get_db)
):
    """
    REAL month-wise resolution efficiency per department
    """
    try:
        department_map = {
            "water_dept": "Water Dept",
            "road_dept": "Road Dept",
            "sanitation_dept": "Sanitation Dept",
            "electricity_dept": "Electricity Dept",
        }

        trends = []

        for dept_key, dept_name in department_map.items():

            query = text("""
                SELECT
                    DATE_TRUNC('month', updated_at) AS month,
                    COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved,
                    COUNT(*) AS total
                FROM reports
                WHERE department = :dept
                GROUP BY month
                ORDER BY month DESC
                LIMIT :months
            """)

            result = await db.execute(
                query,
                {"dept": dept_key, "months": months}
            )

            rows = result.fetchall()
            rows.reverse()  # oldest → newest

            if not rows:
                continue

            data = []
            labels = []

            for row in rows:
                efficiency = (
                    (row.resolved / row.total) * 100
                    if row.total > 0 else 0
                )
                data.append(round(efficiency, 1))
                labels.append(row.month.strftime("%b"))

            trends.append({
                "department": dept_name,
                "data": data,
                "months": labels
            })

        return {"trends": trends}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resolution trend error: {str(e)}"
        )


@app.get("/api/departments/{dept_id}")
async def get_department_details(
    dept_id: int,
    period: str = Query("month", description="Time period: week, month, year"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get REAL detailed information for a specific department
    """
    try:
        # Map department IDs to database keys
        id_to_dept = {
            1: ("water_dept", "Water Dept"),
            2: ("road_dept", "Road Dept"),
            3: ("sanitation_dept", "Sanitation Dept"),
            4: ("electricity_dept", "Electricity Dept"),
            5: ("other", "Other")
        }
        
        if dept_id not in id_to_dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        dept_key, dept_name = id_to_dept[dept_id]
        
        # Get REAL statistics from database
        status_result = await db.execute(
            select(Report.status, func.count(Report.id))
            .where(Report.department == dept_key)
            .group_by(Report.status)
        )
        status_counts = dict(status_result.all())
        
        resolved = status_counts.get("Resolved", 0)
        pending = status_counts.get("Pending", 0)
        progress = status_counts.get("In Progress", 0)
        total_issues = resolved + pending + progress
        
        efficiency = round((resolved / total_issues * 100) if total_issues > 0 else 0, 1)
        
        return {
            "id": dept_id,
            "name": dept_name,
            "icon": get_department_icon(dept_name),
            "resolved": resolved,
            "pending": pending,
            "progress": progress,
            "efficiency": efficiency,
            "total_issues": total_issues,
            "efficiency_trend": generate_efficiency_trend(dept_id),
            "breakdown": {
                "resolved_percentage": round((resolved / total_issues * 100) if total_issues > 0 else 0, 1),
                "pending_percentage": round((pending / total_issues * 100) if total_issues > 0 else 0, 1),
                "progress_percentage": round((progress / total_issues * 100) if total_issues > 0 else 0, 1)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching department details: {str(e)}"
        )

# 3. Get Issues by Department (for bar chart)

@app.get("/api/departments/issues/by-department")
async def get_issues_by_department(
    period: str = Query("month", description="Time period: week, month, year"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get REAL issues count per department for bar chart
    """
    try:
        department_display_names = {
            "water_dept": "Water Dept",
            "road_dept": "Road Dept",
            "sanitation_dept": "Sanitation Dept",
            "electricity_dept": "Electricity Dept",
            "other": "Other"
        }
        
        data = []
        
        for dept_key, dept_name in department_display_names.items():
            # Get real count from database
            count_result = await db.execute(
                select(func.count(Report.id))
                .where(Report.department == dept_key)
            )
            count = count_result.scalar() or 0
            
            # Only include departments with issues
            if count > 0:
                data.append({
                    "department": dept_name,
                    "issues_count": float(count)
                })
        
        print(f"✅ Bar chart data: {data}")
        
        return {
            "data": data,
            "period": period
        }
        
    except Exception as e:
        print(f"❌ Error fetching issues by department: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching issues by department: {str(e)}"
        )


# 5. Submit Feedback for Department - REMOVE AUTH
@app.post("/api/departments/feedback")
async def submit_department_feedback(
    feedback: DepartmentFeedbackRequest,
    db: AsyncSession = Depends(get_db)
    # REMOVED: current_user: User = Depends(get_current_user)
):
    """
    Submit feedback for a department
    """
    try:
        # In a real app, you'd save this to a department_feedback table
        return {
            "message": f"Feedback submitted for department {feedback.department_id}",
            "feedback_id": 123,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting feedback: {str(e)}"
        )

# 6. Update Issues Status (Mark as Resolved) - REMOVE AUTH
@app.post("/api/departments/update-issues-status")
async def update_issues_status(
    update: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db)
    # REMOVED: current_user: User = Depends(get_current_admin)
):
    """
    Bulk update issues status for a department
    """
    try:
        # Update issues in database
        for issue_id in update.issue_ids:
            result = await db.execute(
                select(Report).filter(Report.id == issue_id)
            )
            report = result.scalar_one_or_none()
            if report:
                # Get status ID for the new status
                status_result = await db.execute(
                    select(Status).filter(Status.name == update.new_status)
                )
                status_obj = status_result.scalar_one_or_none()
                if status_obj:
                    report.status_id = status_obj.id
                    report.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return {
            "message": f"Updated {len(update.issue_ids)} issues to {update.new_status}",
            "updated_count": len(update.issue_ids),
            "department_id": update.department_id
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating issues status: {str(e)}"
        )

def generate_trend_data(current_efficiency: float, months: int = 6):
    """
    Generate a realistic efficiency trend leading to current efficiency
    """
    base = max(current_efficiency - random.uniform(10, 25), 30)
    step = (current_efficiency - base) / max(months - 1, 1)

    trend = []
    for i in range(months):
        value = base + step * i + random.uniform(-2, 2)
        trend.append(round(min(max(value, 0), 100), 1))

    return trend
@app.get("/api/departments/{dept_id}/status-breakdown")
async def get_department_status_breakdown(
    dept_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get resolved / pending / in-progress breakdown for a department
    """
    id_to_dept = {
        1: ("water_dept", "Water Dept"),
        2: ("road_dept", "Road Dept"),
        3: ("sanitation_dept", "Sanitation Dept"),
        4: ("electricity_dept", "Electricity Dept"),
        5: ("other", "Other")
    }

    if dept_id not in id_to_dept:
        raise HTTPException(status_code=404, detail="Department not found")

    dept_key, dept_name = id_to_dept[dept_id]

    total_result = await db.execute(
        select(func.count(Report.id))
        .where(Report.department == dept_key)
    )
    total = total_result.scalar() or 0

    resolved = await db.execute(
        select(func.count(Report.id))
        .where(Report.department == dept_key)
        .where(Report.status == "Resolved")
    )
    pending = await db.execute(
        select(func.count(Report.id))
        .where(Report.department == dept_key)
        .where(Report.status == "Pending")
    )
    progress = await db.execute(
        select(func.count(Report.id))
        .where(Report.department == dept_key)
        .where(Report.status == "In Progress")
    )

    resolved_count = resolved.scalar() or 0
    pending_count = pending.scalar() or 0
    progress_count = progress.scalar() or 0

    return {
        "department_id": dept_id,
        "total": total,
        "resolved": resolved_count,
        "pending": pending_count,
        "in_progress": progress_count,
        "percentages": {
            "resolved": round((resolved_count / total * 100), 1) if total else 0,
            "pending": round((pending_count / total * 100), 1) if total else 0,
            "in_progress": round((progress_count / total * 100), 1) if total else 0,
        }
    }

@app.get("/api/departments/{dept_id}/efficiency-trend")
async def get_department_efficiency_trend(
    dept_id: int,
    months: int = Query(6, ge=1, le=12, description="Number of months for trend"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get efficiency trend for a specific department
    """
    try:
        id_to_dept = {
            1: ("water_dept", "Water Dept"),
            2: ("road_dept", "Road Dept"),
            3: ("sanitation_dept", "Sanitation Dept"),
            4: ("electricity_dept", "Electricity Dept"),
            5: ("other", "Other")
        }
        
        if dept_id not in id_to_dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        dept_key, dept_name = id_to_dept[dept_id]
        
        # Get current efficiency
        total_result = await db.execute(
            select(func.count(Report.id))
            .where(Report.department == dept_key)
        )
        total = total_result.scalar() or 0
        
        resolved_result = await db.execute(
            select(func.count(Report.id))
            .where(Report.department == dept_key)
            .where(Report.status == "Resolved")
        )
        resolved = resolved_result.scalar() or 0
        
        current_efficiency = (resolved / total * 100) if total > 0 else 0
        
        # Generate trend based on current efficiency
        trend_data = generate_trend_data(current_efficiency)
        
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        return {
            "department_id": dept_id,
            "efficiency_trend": trend_data[-months:],
            "months": month_names[-months:],
            "current_efficiency": current_efficiency
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching efficiency trend: {str(e)}"
        )


@app.get("/debug/check-user-reports")
async def debug_check_user_reports(
    user_email: str = Query(..., description="User email to check"),
    db: AsyncSession = Depends(get_db)
):
    """
    Debug endpoint to check exact user reports (FIXED isoformat error)
    """
    try:
        print(f"🔍 DEBUG: Checking exact matches for email: {user_email}")
        
        # Check exact email match
        exact_result = await db.execute(
            select(Report)
            .filter(Report.user_email == user_email)
        )
        exact_reports = exact_result.scalars().all()
        
        # Also check if there are any similar emails
        similar_result = await db.execute(
            select(Report.user_email, func.count(Report.id))
            .group_by(Report.user_email)
        )
        all_emails = similar_result.all()
        
        report_details = []
        for report in exact_reports:
            # FIXED: Handle None created_at safely
            created_at_str = report.created_at.isoformat() if report.created_at else None
            
            report_details.append({
                "id": report.id,
                "title": report.title,
                "user_email": report.user_email,
                "user_name": report.user_name,
                "created_at": created_at_str,  # FIXED: This was causing the error
                "category_id": report.category_id,
                "status_id": report.status_id
            })
        
        return {
            "searching_for_email": user_email,
            "exact_match_count": len(exact_reports),
            "exact_reports": report_details,
            "all_emails_in_database": [{"email": email, "count": count} for email, count in all_emails],
            "message": f"Found {len(exact_reports)} exact matches for {user_email}"
        }
        
    except Exception as e:
        print(f"❌ DEBUG Error: {str(e)}")
        import traceback
        print(f"❌ DEBUG Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug error: {str(e)}"
        )
    



# User Profile Schemas (add before the endpoints)
class UserProfileResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    mobile_number: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None

    @field_validator('full_name')
    def validate_full_name(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Full name cannot be empty')
            if len(v) < 2:
                raise ValueError('Full name must be at least 2 characters long')
            if not re.match(r'^[a-zA-Z\s_]+$', v):
                raise ValueError('Full name can only contain letters, spaces and underscores')
        return v.strip() if v else v

    @field_validator('mobile_number')
    def validate_mobile_number(cls, v):
        if v is not None:
            if not re.match(r'^\d{10}$', v):
                raise ValueError('Mobile number must be exactly 10 digits')
        return v



    
# Add these endpoints to your main.py

@app.get("/api/admin/map/issues", response_model=MapIssuesResponse)
async def get_map_issues(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all issues with coordinates for map display
    """
    try:
        # Build query - ensure coordinates exist
        stmt = select(Report).where(
            Report.location_lat.isnot(None), 
            Report.location_long.isnot(None)
        )
        
        # Filter by status if provided
        if status and status.lower() != "all":
            stmt = stmt.where(Report.status == status)
        
        # Filter by urgency level (not category) if provided
        if category and category.lower() != "all":
            # Actually filtering by urgency_level based on your Flutter code
            stmt = stmt.where(Report.urgency_level == category)
        
        # Execute query
        result = await db.execute(stmt)
        reports = result.scalars().all()
        
        # Format response - handle None values gracefully
        map_issues = []
        for report in reports:
            try:
                map_issues.append(MapIssueResponse(
                    id=report.id,
                    title=report.title or "Untitled Issue",
                    status=report.status or "Pending",
                    urgency_level=report.urgency_level or "Medium",
                    location_lat=report.location_lat,
                    location_long=report.location_long,
                    description=report.description,
                    created_at=report.created_at or datetime.utcnow(),
                    user_email=report.user_email,
                    location_address=report.location_address
                ))
            except Exception as e:
                print(f"Error processing report {report.id}: {str(e)}")
                continue
        
        return MapIssuesResponse(issues=map_issues)
        
    except Exception as e:
        print(f"Error in get_map_issues: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching map issues: {str(e)}"
        )


@app.get("/api/admin/map/issues-in-bounds", response_model=MapIssuesResponse)
async def get_issues_in_bounds(
    north: float,
    south: float,
    east: float,
    west: float,
    db: AsyncSession = Depends(get_db)
):
    """
    Get issues within specific geographic bounds
    """
    try:
        # Validate bounds
        if north <= south:
            raise HTTPException(
                status_code=400, 
                detail="North must be greater than south"
            )
        if east <= west:
            raise HTTPException(
                status_code=400, 
                detail="East must be greater than west"
            )
        
        # Build query with bounds
        stmt = select(Report).where(
            Report.location_lat.isnot(None),
            Report.location_long.isnot(None),
            Report.location_lat.between(south, north),
            Report.location_long.between(west, east)
        )
        
        result = await db.execute(stmt)
        reports = result.scalars().all()
        
        # Format response
        map_issues = []
        for report in reports:
            try:
                map_issues.append(MapIssueResponse(
                    id=report.id,
                    title=report.title or "Untitled Issue",
                    status=report.status or "Pending",
                    urgency_level=report.urgency_level or "Medium",
                    location_lat=report.location_lat,
                    location_long=report.location_long,
                    description=report.description,
                    created_at=report.created_at or datetime.utcnow(),
                    user_email=report.user_email,
                    location_address=report.location_address
                ))
            except Exception as e:
                print(f"Error processing report {report.id}: {str(e)}")
                continue
        
        return MapIssuesResponse(issues=map_issues)
        
    except Exception as e:
        print(f"Error in get_issues_in_bounds: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching bounded issues: {str(e)}"
        )


@app.get("/api/admin/map/stats", response_model=MapStatsResponse)
async def get_map_stats(db: AsyncSession = Depends(get_db)):
    """
    Get statistics for map view
    """
    try:
        # Count total issues with coordinates
        stmt_total = select(Report).where(
            Report.location_lat.isnot(None),
            Report.location_long.isnot(None)
        )
        result_total = await db.execute(stmt_total)
        total_issues = len(result_total.scalars().all())
        
        # Count by status - Pending
        stmt_pending = select(Report).where(
            Report.status == "Pending",
            Report.location_lat.isnot(None),
            Report.location_long.isnot(None)
        )
        result_pending = await db.execute(stmt_pending)
        pending_issues = len(result_pending.scalars().all())
        
        # Count by status - In Progress
        stmt_in_progress = select(Report).where(
            Report.status == "In Progress",
            Report.location_lat.isnot(None),
            Report.location_long.isnot(None)
        )
        result_in_progress = await db.execute(stmt_in_progress)
        in_progress_issues = len(result_in_progress.scalars().all())
        
        # Count by status - Resolved
        stmt_resolved = select(Report).where(
            Report.status == "Resolved",
            Report.location_lat.isnot(None),
            Report.location_long.isnot(None)
        )
        result_resolved = await db.execute(stmt_resolved)
        resolved_issues = len(result_resolved.scalars().all())
        
        return MapStatsResponse(
            total_issues=total_issues,
            pending_issues=pending_issues,
            in_progress_issues=in_progress_issues,
            resolved_issues=resolved_issues
        )
        
    except Exception as e:
        print(f"Error in get_map_stats: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching map stats: {str(e)}"
        )


# Add these to your FastAPI backend

@app.get("/api/admin/dashboard/stats")
async def get_admin_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Get real-time statistics for admin dashboard
    """
    try:
        # Total reports count
        total_reports_result = await db.execute(select(func.count(Report.id)))
        total_reports = total_reports_result.scalar() or 0
        
        # Resolved reports count
        resolved_reports_result = await db.execute(
            select(func.count(Report.id)).where(Report.status == "Resolved")
        )
        resolved_reports = resolved_reports_result.scalar() or 0
        
        # Pending reports count
        pending_reports_result = await db.execute(
            select(func.count(Report.id)).where(Report.status == "Pending")
        )
        pending_reports = pending_reports_result.scalar() or 0
        
        return {
            "total_issues": total_reports,
            "resolved_issues": resolved_reports,
            "pending_issues": pending_reports,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching admin dashboard stats: {str(e)}"
        )
@app.get("/api/admin/dashboard/monthly-trends")
async def get_monthly_trends(db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow().replace(day=1)
    monthly_data = []

    for i in range(5, -1, -1):
        start = now - relativedelta(months=i)
        end = start + relativedelta(months=1)

        result = await db.execute(
            select(func.count(Report.id))
            .where(Report.created_at >= start)
            .where(Report.created_at < end)
        )

        monthly_data.append({
            "month": start.strftime("%b"),
            "issues": result.scalar() or 0
        })

    return {"monthly_trends": monthly_data}


@app.get("/api/admin/dashboard/department-performance")
async def get_department_performance(db: AsyncSession = Depends(get_db)):
    """
    Get department performance based on resolved issues
    """
    try:
        actual_departments = [
            "water_dept",        
            "road_dept",         
            "sanitation_dept",   
            "electricity_dept",  
            "public_works",      
            "other"              
        ]
        
        performance_data = []
        
        for dept in actual_departments:
            # Total issues for this department
            total_issues_result = await db.execute(
                select(func.count(Report.id)).where(Report.department == dept)
            )
            total_issues = total_issues_result.scalar() or 0
            
            # Resolved issues for this department
            resolved_issues_result = await db.execute(
                select(func.count(Report.id))
                .where(Report.department == dept)
                .where(Report.status == "Resolved")
            )
            resolved_issues = resolved_issues_result.scalar() or 0
            
            # Calculate progress percentage
            progress = resolved_issues / total_issues if total_issues > 0 else 0
            
            # ✅ Convert department name to display format
            display_name = dept.replace("_", " ").title()
            
            performance_data.append({
                "department": display_name,  # ✅ Display as "Water Dept"
                "total_issues": total_issues,
                "resolved_issues": resolved_issues,
                "progress": round(progress, 2),
                "progress_percentage": round(progress * 100)
            })
        
        # Sort by progress percentage (highest first)
        performance_data.sort(key=lambda x: x["progress_percentage"], reverse=True)
        
        return {"departments": performance_data}
        
    except Exception as e:
        print(f"❌ Error in department performance: {e}")
        # If error, get actual departments from database
        departments_result = await db.execute(
            select(Report.department).distinct().where(Report.department.isnot(None))
        )
        departments = departments_result.scalars().all()
        
        performance_data = []
        for dept in departments:
            if dept:
                total_issues_result = await db.execute(
                    select(func.count(Report.id)).where(Report.department == dept)
                )
                total_issues = total_issues_result.scalar() or 0
                
                resolved_issues_result = await db.execute(
                    select(func.count(Report.id))
                    .where(Report.department == dept)
                    .where(Report.status == "Resolved")
                )
                resolved_issues = resolved_issues_result.scalar() or 0
                
                progress = resolved_issues / total_issues if total_issues > 0 else 0
                
                # ✅ Convert to display format
                display_name = dept.replace("_", " ").title() if "_" in dept else dept
                
                performance_data.append({
                    "department": display_name,
                    "total_issues": total_issues,
                    "resolved_issues": resolved_issues,
                    "progress": round(progress, 2),
                    "progress_percentage": round(progress * 100)
                })
        
        return {"departments": performance_data}

@app.get("/api/admin/dashboard/recent-reports")
async def get_recent_reports(db: AsyncSession = Depends(get_db), limit: int = 4):
    """
    Get most recent reports for dashboard
    """
    try:
        recent_reports_result = await db.execute(
            select(Report)
            .order_by(Report.created_at.desc())
            .limit(limit)
        )
        recent_reports = recent_reports_result.scalars().all()
        
        formatted_reports = []
        for report in recent_reports:
            # Calculate time ago
            time_ago = get_time_ago(report.created_at or datetime.utcnow())
            
            formatted_reports.append({
                "id": report.id,
                "title": report.title,
                "description": report.description,
                "location": report.location_address or "Location not specified",
                "status": report.status or "Pending",
                "time_ago": time_ago,
                "department": report.department or "Not assigned",
                "created_at": report.created_at.isoformat() if report.created_at else datetime.utcnow().isoformat()
            })
        
        return {"recent_reports": formatted_reports}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching recent reports: {str(e)}"
        )

def get_time_ago(timestamp: datetime) -> str:
    """Helper function to get human readable time ago"""
    now = datetime.utcnow()
    diff = now - timestamp
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"


class IssueRequest(BaseModel):
    description: str
    image_data: Optional[str] = None

def combine_predictions(text_pred, text_confidence, img_pred=None, img_confidence=None):
    """
    Combine text and image predictions intelligently
    """
    # If no image, use text prediction
    if img_pred is None:
        return text_pred, text_confidence
    
    # If both predictions agree, use with higher confidence
    if text_pred == img_pred:
        final_confidence = max(text_confidence, img_confidence)
        return text_pred, final_confidence
    
    # If predictions disagree, use the one with higher confidence
    # You can adjust these thresholds based on your testing
    text_weight = text_confidence / 100
    img_weight = img_confidence / 100
    
    # Weighted decision (you can tune these weights)
    if text_confidence >= 70:  # High confidence in text
        return text_pred, text_confidence
    elif img_confidence >= 80:  # High confidence in image
        return img_pred, img_confidence
    else:
        # Default to text prediction if both are uncertain
        return text_pred, text_confidence

@app.post("/api/predict-department")
async def predict_department(
    description: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    try:
        # Step 1: Get text prediction
        text_pred, text_conf, text_top3 = predict_department_from_text(description)
        
        # Step 2: Get image prediction if available
        img_pred = None
        img_conf = None
        
        if image and image.content_type.startswith('image/'):
            image_bytes = await image.read()
            processed_image = preprocess_image(image_bytes)
            predictions = model.predict(processed_image)
            class_idx = np.argmax(predictions[0])
            original_pred = original_class_labels[class_idx]
            img_conf = float(predictions[0][class_idx]) * 100
            img_pred = department_mapping.get(original_pred, "other")
        
        # Step 3: Combine predictions
        final_department, final_confidence = combine_predictions(
            text_pred, text_conf, img_pred, img_conf
        )
        
        return {
            "final_department": final_department,
            "final_confidence": final_confidence,
            "text_prediction": {
                "department": text_pred,
                "confidence": text_conf,
                "top3_alternatives": text_top3
            },
            "image_prediction": {
                "department": img_pred,
                "confidence": img_conf
            } if img_pred else None,
            "success": True
        }
        
    except Exception as e:
        raise HTTPException(500, f"Prediction error: {str(e)}")

@app.post("/predict-text-only")
async def predict_text_only(description: str):
    """Endpoint for text-only prediction"""
    try:
        pred, confidence, top3 = predict_department_from_text(description)
        return {
            "department": pred,
            "confidence": confidence,
            "top3_alternatives": top3,
            "success": True
        }
    except Exception as e:
        raise HTTPException(500, f"Text prediction error: {str(e)}")



@app.post("/api/ai/auto-assign")
async def auto_assign_departments(
    force_reassign: bool = Body(False),
    urgency_level: str = Body("Medium"),  # ✅ CHANGED: "Medium" with capital M
    db: AsyncSession = Depends(get_db)
):
    """
    Auto-assign departments to unassigned issues using your existing AI prediction
    """
    try:
        # Validate urgency_level against your validator
        valid_urgency_levels = ["High", "Medium", "Low"]
        if urgency_level not in valid_urgency_levels:
            raise HTTPException(
                status_code=400, 
                detail=f'Urgency level must be one of: {", ".join(valid_urgency_levels)}'
            )
        
        # Get unassigned or force-reassign all issues
        if force_reassign:
            stmt = select(Report).where(Report.status.in_(["Pending", "In Progress"]))
        else:
            stmt = select(Report).where(Report.department == "other")
        
        result = await db.execute(stmt)
        issues = result.scalars().all()
        
        assigned_count = 0
        processed_count = 0
        
        for issue in issues:
            try:
                processed_count += 1
                
                # Skip if description is too short for meaningful prediction
                if not issue.description or len(issue.description.strip()) < 10:
                    continue
                
                print(f"🔍 Processing issue {issue.id}: {issue.description[:50]}...")
                
                # ✅ FIXED: Use your existing text-only prediction endpoint
                prediction_response = await predict_text_only(issue.description)
                
                if (prediction_response.get('success') and 
                    prediction_response.get('department') != 'other' and
                    prediction_response.get('confidence', 0) > 50):  # Minimum confidence threshold
                    
                    issue.department = prediction_response['department']
                    issue.auto_assigned = True
                    issue.prediction_confidence = prediction_response['confidence']
                    assigned_count += 1
                    
                    print(f"✅ Assigned issue {issue.id} to {issue.department} "
                          f"(confidence: {prediction_response['confidence']}%)")
                
                # Add small delay to avoid overwhelming the system
                await asyncio.sleep(0.1)
                
            except Exception as e:
                print(f"❌ Failed to process issue {issue.id}: {e}")
                continue
        
        await db.commit()
        
        return {
            "message": f"AI auto-assignment completed. {assigned_count} issues assigned out of {processed_count} processed.",
            "assigned_count": assigned_count,
            "processed_count": processed_count,
            "total_issues": len(issues),
            "urgency_level": urgency_level  # ✅ Include the urgency level in response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Auto-assignment failed: {str(e)}")
@app.get("/api/ai/assignment-status")
async def get_assignment_status(db: AsyncSession = Depends(get_db)):
    """
    Get AI assignment statistics
    """
    try:
        # Count auto-assigned issues
        auto_assigned_result = await db.execute(
            select(func.count(Report.id))
            .where(Report.auto_assigned == True)
        )
        auto_assigned_count = auto_assigned_result.scalar() or 0
        
        # Count total issues
        total_result = await db.execute(select(func.count(Report.id)))
        total_issues = total_result.scalar() or 0
        
        # Count unassigned issues
        unassigned_result = await db.execute(
            select(func.count(Report.id))
            .where(Report.department == "other")
        )
        unassigned_count = unassigned_result.scalar() or 0
        
        # Count by department for auto-assigned issues
        dept_result = await db.execute(
            select(Report.department, func.count(Report.id))
            .where(Report.auto_assigned == True)
            .group_by(Report.department)
        )
        dept_counts = dict(dept_result.all())
        
        # Get average confidence for auto-assigned issues
        confidence_result = await db.execute(
            select(func.avg(Report.prediction_confidence))
            .where(Report.auto_assigned == True)
        )
        avg_confidence = confidence_result.scalar() or 0
        
        return {
            "auto_assigned_count": auto_assigned_count,
            "total_issues": total_issues,
            "unassigned_count": unassigned_count,
            "auto_assigned_percentage": round((auto_assigned_count / total_issues * 100) if total_issues > 0 else 0, 1),
            "department_breakdown": dept_counts,
            "average_confidence": round(avg_confidence, 1),
            "ready_for_assignment": unassigned_count > 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assignment status: {str(e)}")

@app.get("/api/ai/auto-assigned-issues")
async def get_auto_assigned_issues(
    department: Optional[str] = None,
    period: str = "month",
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of auto-assigned issues for a specific department
    """
    try:
        stmt = select(Report).where(Report.auto_assigned == True)
        
        if department and department != "all":
            stmt = stmt.where(Report.department == department)
        
        # Add time period filter if needed
        if period != "all":
            # Calculate date range based on period
            from datetime import datetime, timedelta
            if period == "week":
                start_date = datetime.utcnow() - timedelta(days=7)
            elif period == "month":
                start_date = datetime.utcnow() - timedelta(days=30)
            else:  # year
                start_date = datetime.utcnow() - timedelta(days=365)
            
            stmt = stmt.where(Report.created_at >= start_date)
        
        result = await db.execute(stmt)
        issues = result.scalars().all()
        
        issues_data = []
        for issue in issues:
            issues_data.append({
                "id": issue.id,
                "description": issue.description,
                "department": issue.department,
                "prediction_confidence": issue.prediction_confidence,
                "status": issue.status,
                "created_at": issue.created_at.isoformat() if issue.created_at else None,
                "category": issue.category
            })
        
        return {
            "issues": issues_data,
            "count": len(issues_data),
            "department": department or "all",
            "period": period
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get auto-assigned issues: {str(e)}")
    

@app.get("/api/users/dashboard/stats")
async def get_user_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    week_start = today - relativedelta(days=today.weekday())
    user_email = current_user.email

    total = await db.scalar(
        select(func.count(Report.id))
        .where(Report.user_email == user_email)
    )

    resolved = await db.scalar(
        select(func.count(Report.id))
        .join(Status)
        .where(
            Report.user_email == user_email,
            Status.name == "Resolved"
        )
    )

    today_reports = await db.scalar(
        select(func.count(Report.id))
        .where(
            Report.user_email == user_email,
            func.date(Report.created_at) == today
        )
    )

    week_reports = await db.scalar(
        select(func.count(Report.id))
        .where(
            Report.user_email == user_email,
            func.date(Report.created_at) >= week_start
        )
    )

    return {
        "today_reports": today_reports or 0,
        "week_reports": week_reports or 0,
        "total_reports": total or 0,
        "resolved_reports": resolved or 0
    }



@app.get("/api/users/citizen-score")
async def get_citizen_trust_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Total reports
    total_result = await db.execute(
        select(func.count(Report.id))
        .filter(Report.user_email == current_user.email)
    )
    total = total_result.scalar() or 0

    # Resolved reports
    resolved_result = await db.execute(
        select(func.count(Report.id))
        .join(Status)
        .filter(
            Report.user_email == current_user.email,
            Status.name == "Resolved"
        )
    )
    resolved = resolved_result.scalar() or 0

    if total == 0:
        score = 50
    else:
        resolution_rate = resolved / total
        score = round(50 + (resolution_rate * 50))

    return {
        "citizen_score": score,
        "total_issues": total,
        "resolved_issues": resolved,
        "message": "Citizen trust score calculated successfully"
    }
