from app.database import Base
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional

# ── Role constants ────────────────────────────────────────────────────────────
ROLE_USER = "user"
ROLE_DEPT_ADMIN = "dept_admin"
ROLE_SUPER_ADMIN = "super_admin"

VALID_DEPARTMENTS = [
    "water_dept",
    "road_dept",
    "sanitation_dept",
    "electricity_dept",
    "other",
]


# ── Users ─────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    mobile_number = Column(String(10), unique=True, nullable=False)

    # Legacy flag — kept for backward compat; use `role` for new logic
    is_admin = Column(Boolean, default=False)

    # Role: "user" | "dept_admin" | "super_admin"
    role = Column(String(20), default=ROLE_USER, nullable=False)

    # Which department this admin manages (only relevant when role=dept_admin)
    department = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Account lockout
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    # FCM token for push notifications
    fcm_token = Column(String, nullable=True)

    # Password reset
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    reports = relationship("Report", back_populates="user")


# ── Lookup tables ─────────────────────────────────────────────────────────────
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


# ── Reports ───────────────────────────────────────────────────────────────────
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    # User information
    user_name = Column(String(255), nullable=False)
    user_mobile = Column(String(15), nullable=False)
    user_email = Column(String(255), nullable=True)

    # Issue information
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    issue_type = Column(String(50), nullable=False, default="General")
    category = Column(String(50), nullable=False, default="General")
    urgency_level = Column(String(20), nullable=False)

    # Foreign keys to lookup tables
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=True)

    # Status string (denormalised for easy querying)
    status = Column(String(20), default="Pending")

    # Location
    location_lat = Column(Float, nullable=False)
    location_long = Column(Float, nullable=False)
    location_address = Column(Text, nullable=True)
    distance = Column(Float, nullable=True)

    # Admin assignment
    assigned_department = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String(255), nullable=True)

    # Media
    images = Column(Text, nullable=True)   # JSON list of image paths
    voice_note = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Owner
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="reports")

    # AI assignment
    department: Mapped[str] = mapped_column(String, default="other")
    auto_assigned: Mapped[bool] = mapped_column(Boolean, default=False)
    prediction_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Upvote / confirmation count
    confirmation_count = Column(Integer, default=0)


# ── Confirmations ─────────────────────────────────────────────────────────────
class Confirmation(Base):
    __tablename__ = "confirmations"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    confirmed_at = Column(DateTime, default=datetime.utcnow)


# ── Activity log ──────────────────────────────────────────────────────────────
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String)   # 'report_created' | 'issue_resolved' | 'confirmed'
    report_id = Column(Integer, ForeignKey("reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


# ── Department analysis ───────────────────────────────────────────────────────
class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    email = Column(String(255))
    phone = Column(String(20))
    head_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    stats = relationship("DepartmentStats", back_populates="department")
    feedback = relationship("DepartmentFeedback", back_populates="department")


class DepartmentStats(Base):
    __tablename__ = "department_stats"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)

    total_issues = Column(Integer, default=0)
    resolved_issues = Column(Integer, default=0)
    pending_issues = Column(Integer, default=0)
    in_progress_issues = Column(Integer, default=0)
    efficiency_score = Column(Float, default=0.0)

    period = Column(String(20))
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="stats")


class DepartmentFeedback(Base):
    __tablename__ = "department_feedback"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    feedback_text = Column(Text, nullable=False)
    rating = Column(Integer)
    user_name = Column(String(255))

    status = Column(String(20), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    department = relationship("Department", back_populates="feedback")
    user = relationship("User")
