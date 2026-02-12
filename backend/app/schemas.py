from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional, List
import re
from datetime import datetime
from enum import Enum

class UrgencyLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class Status(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"

class Category(str, Enum):
    GARBAGE = "Garbage"
    WATER = "Water"
    SANITATION = "Sanitation"
    OTHER = "Other"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    mobile_number: str
    is_admin: bool = False

    @field_validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
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

    @field_validator('is_admin')
    def validate_admin_role(cls, v):
        if v:
            raise ValueError('Cannot self-assign admin role during signup')
        return v

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    mobile_number: str
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('password')
    def password_not_empty(cls, v):
        if not v or len(v) < 1:
            raise ValueError('Password cannot be empty')
        return v

class ReportCreate(BaseModel):
    user_name: str
    user_mobile: str
    user_email: Optional[str] = None
    urgency_level: str
    title: str
    description: str
    location_lat: float
    location_long: float
    location_address: Optional[str] = None
    department: Optional[str] = "other"
    auto_assigned: Optional[bool] = False
    prediction_confidence: Optional[float] = None
    
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

    # @field_validator('category')
    # def validate_category(cls, v):
    #     valid_categories = ["Garbage", "Water", "Sanitation", "Other"]
    #     if v not in valid_categories:
    #         raise ValueError(f'Category must be one of: {", ".join(valid_categories)}')
    #     return v

    @field_validator('urgency_level')
    def validate_urgency_level(cls, v):
        valid_urgency_levels = ["Low", "Medium", "High", "Urgent"]
        if v not in valid_urgency_levels:
            raise ValueError(f'Urgency level must be one of: {", ".join(valid_urgency_levels)}')
        return v

    @field_validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        if len(v) < 5:
            raise ValueError('Title must be at least 5 characters long')
        if len(v) > 100:
            raise ValueError('Title cannot exceed 100 characters')
        return v.strip()

    @field_validator('description')
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValueError('Description cannot be empty')
        if len(v) < 10:
            raise ValueError('Description must be at least 10 characters long')
        if len(v) > 1000:
            raise ValueError('Description cannot exceed 1000 characters')
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

class ReportResponse(BaseModel):
    id: int
    user_name: str
    user_mobile: str
    user_email: Optional[str]
    title: str
    description: str
    category: str
    urgency_level: str
    status: str
    location_lat: float
    location_long: float
    location_address: Optional[str]
    distance: Optional[float]
    images: Optional[str]
    voice_note: Optional[str]
    assigned_department: Optional[str]
    resolution_notes: Optional[str]
    resolved_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    user_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)

class ReportCreateWithMedia(BaseModel):
    user_name: str
    user_mobile: str
    user_email: Optional[str] = None
    title: str
    description: str
    category: str
    urgency_level: str
    location_lat: float
    location_long: float
    location_address: Optional[str] = None
    image_paths: Optional[List[str]] = None
    voice_note_path: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    is_admin: bool
    full_name: str
    email: str
    message: str

class FileUploadResponse(BaseModel):
    filename: str
    file_url: str
    message: str

class UrgencyLevelsResponse(BaseModel):
    urgency_levels: List[str]

class CategoriesResponse(BaseModel):
    categories: List[str]

class StatusResponse(BaseModel):
    statuses: List[str]

# Admin schemas
class StatusUpdate(BaseModel):
    status: str  # "Pending", "In Progress", "Resolved"

    @field_validator('status')
    def validate_status(cls, v):
        valid_statuses = ["Pending", "In Progress", "Resolved"]
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v

class DepartmentAssign(BaseModel):
    department: str

class ResolveIssue(BaseModel):
    resolution_notes: str
    resolved_by: str

class AdminReportsResponse(BaseModel):
    reports: List[ReportResponse]
    total_count: int
    pending_count: int
    in_progress_count: int
    resolved_count: int

class ReportStats(BaseModel):
    total_reports: int
    pending_reports: int
    in_progress_reports: int
    resolved_reports: int

# ========== DEPARTMENT ANALYSIS SCHEMAS ==========

class DepartmentFeedbackRequest(BaseModel):
    department_id: int
    feedback_text: str
    rating: Optional[int] = None
    user_name: Optional[str] = None

    @field_validator('feedback_text')
    def validate_feedback_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Feedback text cannot be empty')
        if len(v) < 10:
            raise ValueError('Feedback must be at least 10 characters long')
        if len(v) > 1000:
            raise ValueError('Feedback cannot exceed 1000 characters')
        return v.strip()

    @field_validator('rating')
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Rating must be between 1 and 5')
        return v

class StatusUpdateRequest(BaseModel):
    department_id: int
    issue_ids: List[int]
    new_status: str

    @field_validator('new_status')
    def validate_status(cls, v):
        valid_statuses = ["Pending", "In Progress", "Resolved"]
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v

    @field_validator('issue_ids')
    def validate_issue_ids(cls, v):
        if not v:
            raise ValueError('At least one issue ID must be provided')
        if len(v) > 100:
            raise ValueError('Cannot update more than 100 issues at once')
        return v

class ResolveIssuesRequest(BaseModel):
    department_id: int
    issue_ids: List[int]
    resolution_notes: str

    @field_validator('resolution_notes')
    def validate_resolution_notes(cls, v):
        if not v or not v.strip():
            raise ValueError('Resolution notes cannot be empty')
        if len(v) < 10:
            raise ValueError('Resolution notes must be at least 10 characters long')
        return v.strip()

class DepartmentSummary(BaseModel):
    id: int
    name: str
    icon: str
    resolved: int
    pending: int
    progress: int
    efficiency: float
    total_issues: int
    resolution_trend: List[float]

    class Config:
        from_attributes = True

class DepartmentDetails(BaseModel):
    id: int
    name: str
    icon: str
    resolved: int
    pending: int
    progress: int
    efficiency: float
    total_issues: int
    efficiency_trend: List[float]
    breakdown: dict

    class Config:
        from_attributes = True

class DepartmentIssuesData(BaseModel):
    department: str
    issues_count: int

class ResolutionTrend(BaseModel):
    department: str
    data: List[float]
    months: List[str]

class DepartmentEfficiencyTrend(BaseModel):
    department_id: int
    efficiency_trend: List[float]
    months: List[str]
    current_efficiency: float

class DepartmentsSummaryResponse(BaseModel):
    departments: List[DepartmentSummary]
    period: str
    timestamp: str

class DepartmentDetailsResponse(BaseModel):
    department: DepartmentDetails

class DepartmentIssuesResponse(BaseModel):
    data: List[DepartmentIssuesData]
    period: str

class ResolutionTrendsResponse(BaseModel):
    trends: List[ResolutionTrend]

class DepartmentFeedbackResponse(BaseModel):
    message: str
    feedback_id: int
    timestamp: str

class StatusUpdateResponse(BaseModel):
    message: str
    updated_count: int
    department_id: int

class DepartmentEfficiencyResponse(BaseModel):
    department_id: int
    efficiency_trend: List[float]
    months: List[str]
    current_efficiency: float


# Add these to your existing schemas.py

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
    

# ========== MAP SCHEMAS ==========
class MapIssueResponse(BaseModel):
    id: int
    title: str
    status: str
    urgency_level: str  # This is what you're actually using in Flutter
    location_lat: float
    location_long: float
    description: Optional[str] = None
    created_at: datetime
    user_email: Optional[str] = None
    location_address: Optional[str] = None

    class Config:
        from_attributes = True


class MapIssuesResponse(BaseModel):
    issues: List[MapIssueResponse]


class MapBoundsRequest(BaseModel):
    north: float
    south: float
    east: float
    west: float

    @field_validator('north')
    def validate_north(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('North bound must be between -90 and 90')
        return v

    @field_validator('south')
    def validate_south(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('South bound must be between -90 and 90')
        return v

    @field_validator('east')
    def validate_east(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('East bound must be between -180 and 180')
        return v

    @field_validator('west')
    def validate_west(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('West bound must be between -180 and 180')
        return v


class MapStatsResponse(BaseModel):
    total_issues: int
    pending_issues: int
    in_progress_issues: int
    resolved_issues: int