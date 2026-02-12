from app.database import Base
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship,Mapped, mapped_column
from datetime import datetime
from typing import Optional

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    mobile_number = Column(String(10), unique=True, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    reports = relationship("Report", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)

class Status(Base):
    __tablename__ = "statuses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)

class Confirmation(Base):
    __tablename__ = "confirmations"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    confirmed_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String)  # 'report_created', 'issue_resolved', 'confirmed'
    report_id = Column(Integer, ForeignKey("reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User Information
    user_name = Column(String(255), nullable=False)
    user_mobile = Column(String(15), nullable=False)
    user_email = Column(String(255), nullable=True)

    # Issue Information
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    issue_type = Column(String(50), nullable=False, default="General")  # ✅ Add default
    category = Column(String(50), nullable=False, default="General")    # ✅ Add default
    urgency_level = Column(String(20), nullable=False)

    # Foreign keys
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=True)
    
    # Status Information
    status = Column(String(20), default="Pending")
    
    # Location Information
    location_lat = Column(Float, nullable=False)
    location_long = Column(Float, nullable=False)
    location_address = Column(Text, nullable=True)
    distance = Column(Float, nullable=True)
    
    # Admin Assignment
    assigned_department = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String(255), nullable=True)
    
    # Media Files
    images = Column(Text, nullable=True)
    voice_note = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="reports")
    department: Mapped[str] = mapped_column(String, default="other")
    auto_assigned: Mapped[bool] = mapped_column(Boolean, default=False)
    prediction_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
# ========== DEPARTMENT ANALYSIS MODELS ==========

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    icon = Column(String(50))  # Icon name for frontend
    email = Column(String(255))
    phone = Column(String(20))
    head_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    stats = relationship("DepartmentStats", back_populates="department")
    feedback = relationship("DepartmentFeedback", back_populates="department")

class DepartmentStats(Base):
    __tablename__ = "department_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    
    # Statistics
    total_issues = Column(Integer, default=0)
    resolved_issues = Column(Integer, default=0)
    pending_issues = Column(Integer, default=0)
    in_progress_issues = Column(Integer, default=0)
    efficiency_score = Column(Float, default=0.0)  # Percentage
    
    # Time period
    period = Column(String(20))  # 'week', 'month', 'year'
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    
    # Timestamps
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    department = relationship("Department", back_populates="stats")

class DepartmentFeedback(Base):
    __tablename__ = "department_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Feedback content
    feedback_text = Column(Text, nullable=False)
    rating = Column(Integer)  # 1-5 scale
    user_name = Column(String(255))  # Store name if user not registered
    
    # Status
    status = Column(String(20), default="Pending")  # Pending, Reviewed, Actioned
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    
    # Relationships
    department = relationship("Department", back_populates="feedback")
    user = relationship("User")