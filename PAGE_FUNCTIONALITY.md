# CivicEye — Page & API Functionality Reference

A complete reference of what every frontend page does and which backend API endpoints it uses.

---

## FRONTEND PAGES

### 1. Splash Screen
**File:** `civic_eye_app/lib/screens/splash_screen.dart`

**What it does:**
- Shows the app logo/branding on launch
- Checks if the user is already logged in
- Redirects to Login Screen or Home Screen accordingly

**Backend APIs used:** None (reads local storage/token only)

---

### 2. Login Screen
**File:** `civic_eye_app/lib/screens/auth/login_screen.dart`

**What it does:**
- Lets users enter email and password to sign in
- Shows error messages for wrong credentials or locked accounts
- Redirects regular users to Home Screen, admins to Admin Shell
- Has a "Forgot Password?" link and a "Sign Up" link

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | Authenticate user, get JWT token |

---

### 3. Register Screen
**File:** `civic_eye_app/lib/screens/auth/register_screen.dart`

**What it does:**
- New user registration form (name, email, mobile, password)
- Shows a live password strength indicator
- Validates all fields before submitting
- On success, redirects to Home Screen

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/register` | Create a new user account |

---

### 4. Forgot Password Screen
**File:** `civic_eye_app/lib/screens/auth/forgot_password_screen.dart`

**What it does:**
- Allows users to request a password reset via email

**Backend APIs used:** Password reset endpoint (if implemented)

---

### 5. Home Screen (Shell)
**File:** `civic_eye_app/lib/screens/home/home_screen.dart`

**What it does:**
- Acts as the bottom navigation shell for regular users
- Contains tabs: Dashboard, Report Issue, My Reports, Profile

**Backend APIs used:** None directly (delegates to tabs)

---

### 6. Dashboard Tab
**File:** `civic_eye_app/lib/screens/home/dashboard_tab.dart`

**What it does:**
- Shows a personalized greeting (Good Morning/Afternoon/Evening + user's name)
- Displays 3 stat cards: Total reports, Resolved, Pending
- Shows "Quick Actions" buttons: Report Issue and Track Issues
- Lists the user's 5 most recent reports
- Pull-to-refresh support

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/reports/filtered` | Load user's reports and compute stats |

---

### 7. Report Screen (Submit Issue)
**File:** `civic_eye_app/lib/screens/report/report_screen.dart`

**What it does:**
- Step 1: Take or upload a photo of the civic issue (camera or gallery)
- Step 2: Capture GPS location automatically
- Step 3: Select urgency level (Low / Medium / High)
- Submits the image + location to the backend
- AI model auto-detects the issue type and assigns it to the correct department
- Shows a success dialog with AI detection result (issue type, department, confidence %)

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/reports/smart` | Submit image + GPS, AI auto-detects issue and assigns department |

---

### 8. My Reports Screen
**File:** `civic_eye_app/lib/screens/reports/my_reports_screen.dart`

**What it does:**
- Lists all reports submitted by the logged-in user
- Shows stats: Total, Resolved, Pending
- Filter chips: All / Pending / In Progress / Resolved
- Search bar: search by title, complaint ID (#12345), or description
- Each report card shows title, status badge, category, urgency, date, location, and images
- Tap a report to open Report Detail Screen
- Tap the **edit icon** on a card to edit the report's title, description, and urgency (only while status is "Reported")
- Long press or tap delete icon to delete a report (with confirmation dialog)

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/reports/filtered` | Load user's reports with optional status filter |
| GET | `/users/reports/search` | Search reports by query text or complaint ID |
| PATCH | `/api/users/reports/{report_id}` | Edit user's own report (title, description, urgency) |
| DELETE | `/api/users/reports/{report_id}` | Delete user's own report |

---

### 9. Report Detail Screen
**File:** `civic_eye_app/lib/screens/reports/report_detail_screen.dart`

**What it does:**
- Shows full details of a single report: title, description, category, urgency, department, submission date, AI confidence
- Displays attached photos
- Shows a location card with GPS coordinates and "Open in Google Maps" button
- Shows a status timeline stepper: Submitted → Assigned → In Progress → Resolved (or Rejected)
- Upvote/Confirm button (thumb up) to confirm the issue exists — shows confirmation count
- Unconfirm by tapping again

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/reports/{report_id}/timeline` | Load full report details + timeline events |
| GET | `/api/reports/{report_id}/confirm-status` | Check if current user has confirmed this report |
| POST | `/api/reports/{report_id}/confirm` | Confirm/upvote the report |
| DELETE | `/api/reports/{report_id}/confirm` | Remove confirmation (unvote) |

---

### 10. Notifications Screen
**File:** `civic_eye_app/lib/screens/notifications/notifications_screen.dart`

**What it does:**
- Lists all notifications for the logged-in user
- Shows notification type icons (resolved, status change, urgent, priority change)
- Unread notifications are highlighted with a colored dot
- Tap a notification to mark it as read
- "Mark all read" button in the app bar
- Pull-to-refresh support

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | Load all notifications for the user |
| PATCH | `/api/notifications/{id}/read` | Mark a single notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

---

### 11. Profile Screen
**File:** `civic_eye_app/lib/screens/profile/profile_screen.dart`

**What it does:**
- Shows user avatar (initials), name, email, and role badge (Citizen / Administrator)
- Tap the **edit icon** next to the name to quickly open the Edit Profile dialog
- Displays email and mobile number in an info card
- Edit Profile: update full name and mobile number (with validation and loading state)
- Change Password option
- Dark/Light mode toggle
- Notifications settings, Help & Support, About CivicEye
- **Super Admin only:** "Manage Users & Admins" link → opens User Management screen
- **Admin only:** Export reports as CSV or PDF
- Sign Out button with confirmation dialog

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/me` | Load current user profile |
| PUT | `/api/users/me` | Update profile (name, mobile) |
| GET | `/api/admin/export/csv` | Export all reports as CSV (admin only) |
| GET | `/api/admin/export/pdf` | Export all reports as PDF (admin only) |

---

---

## ADMIN PAGES

### 12. Admin Shell
**File:** `civic_eye_app/lib/screens/admin/admin_shell.dart`

**What it does:**
- Bottom navigation shell for admin users
- Tabs: Dashboard, Reports, Map, Departments, Profile
- Dept admins see a dedicated "Dept Reports" screen instead of the full reports tab

**Backend APIs used:** None directly

---

### 13. Admin Dashboard Tab
**File:** `civic_eye_app/lib/screens/admin/admin_dashboard_tab.dart`

**What it does:**
- Shows 4 stat cards: Total Reports, Resolved, Pending, In Progress
- Resolution rate progress bar with percentage
- Lists the 8 most recent reports across all users
- Pull-to-refresh support

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/reports/` | Load all reports (used by ReportProvider.loadAllReports) |
| GET | `/api/admin/dashboard/stats` | Get total/resolved/pending counts |

---

### 14. Admin Reports Tab
**File:** `civic_eye_app/lib/screens/admin/admin_reports_tab.dart`

**What it does:**
- Lists all reports from all users
- Search bar: filter by title or description
- Status filter chips: All / Pending / In Progress / Resolved / Rejected
- Priority filter chips: All / Normal / High / Critical / Urgent
- Each report card shows urgent banner for high-priority issues
- Action buttons per report: Mark In Progress, Resolve, Reject, Delete
- **Super Admin only:** Priority selector (Normal / High / Critical / Urgent) per report

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/reports/` | Load all reports |
| PATCH | `/api/admin/issues/{report_id}/status` | Update report status |
| PATCH | `/api/admin/issues/{report_id}/priority` | Update report priority (super admin) |
| DELETE | `/api/admin/issues/{report_id}` | Delete a report |

---

### 15. Admin Map Tab
**File:** `civic_eye_app/lib/screens/admin/admin_map_tab.dart`

**What it does:**
- Shows all reported issues on a Google Map (native) or as a list (web fallback)
- Color-coded map markers by status: orange = pending, cyan = in progress, green = resolved, red = rejected
- Filter chips: All / Pending / In Progress / Resolved
- Stats bar at the bottom: Total, Pending, Active, Done counts
- Tap a marker to see issue title, status, and urgency in an info window

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/map/issues` | Load all issues with GPS coordinates, optionally filtered by status |
| GET | `/api/admin/map/stats` | Get map statistics (total, pending, in-progress, resolved counts) |

---

### 16. Admin Departments Tab
**File:** `civic_eye_app/lib/screens/admin/admin_dept_tab.dart`

**What it does:**
- Shows a bar chart comparing total vs resolved issues per department
- Lists department cards: Water, Road, Sanitation, Electricity
- Each card shows: total issues, efficiency %, progress bar, resolved/pending/active breakdown
- Pull-to-refresh support

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/departments/summary` | Load all department stats (resolved, pending, efficiency) |
| GET | `/api/departments/issues/by-department` | Get issue counts per department for bar chart |

---

### 17. Dept Admin Reports Screen
**File:** `civic_eye_app/lib/screens/admin/dept_admin_reports_screen.dart`

**What it does:**
- Shown to department admins (water, road, sanitation, electricity) instead of the full admin reports tab
- Lists only reports assigned to the logged-in admin's department
- Stats row: Total, Pending, Active, Done, Urgent counts
- Search bar and status filter chips
- Each report card shows: title, description, tags, date, location (tappable for GPS details), photos, reporter info
- Action buttons: Mark In Progress, Resolve (with completed work photo upload), Reject
- Shows completed work photos after resolution
- Urgent/Critical reports get a highlighted banner

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/dept-admin/reports` | Load reports for the admin's department |
| PATCH | `/api/dept-admin/reports/{report_id}/status` | Update report status (In Progress / Resolved / Rejected) |
| POST | `/api/dept-admin/reports/{report_id}/resolve` | Resolve with completed work image upload |

---

### 18. Super Admin — User Management Screen
**File:** `civic_eye_app/lib/screens/admin/super_admin_users_screen.dart`

**What it does:**
- Accessible only to super admins (via Profile → Manage Users & Admins)
- Shows stats: Total users, Super Admins, Dept Admins, Regular Users
- Filter chips: All / Users / Dept Admins / Super Admins
- Lists all users with name, email, role badge, and department badge
- Per-user actions (3-dot menu): Change Role, Delete User
- Change Role dialog: select role (User / Dept Admin / Super Admin) and department (for dept admins)
- "Add Admin" FAB: create a new admin account with name, email, mobile, password, role, and department

**Backend APIs used:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/super-admin/users` | List all users, optionally filtered by role |
| GET | `/api/super-admin/stats` | Get user count stats |
| PATCH | `/api/super-admin/users/{user_id}/role` | Change a user's role and department |
| DELETE | `/api/super-admin/users/{user_id}` | Delete a user account |
| POST | `/api/super-admin/create-admin` | Create a new admin account |

---

---

## BACKEND API ENDPOINTS

### Authentication
| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/api/users/register` | Register a new citizen user |
| POST | `/api/login` | Login, returns JWT token + user info (role, department) |
| GET | `/api/users/me` | Get current user's profile |
| PUT | `/api/users/me` | Update current user's name/mobile |

### Reports — Citizen
| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/api/reports/smart` | Submit a smart report: upload image + GPS, AI detects issue type and assigns department |
| POST | `/api/reports/` | Submit a manual report (no AI, used for text-based reports) |
| GET | `/api/users/reports/filtered` | Get logged-in user's reports with optional status filter |
| GET | `/users/reports/search` | Search user's reports by text or complaint ID |
| DELETE | `/api/users/reports/{report_id}` | Delete user's own report |
| PATCH | `/api/users/reports/{report_id}` | Edit user's own report (title, description, urgency) |
| GET | `/api/reports/{report_id}/timeline` | Get full report details + status timeline |
| POST | `/api/reports/{report_id}/confirm` | Confirm/upvote a report |
| DELETE | `/api/reports/{report_id}/confirm` | Remove confirmation |
| GET | `/api/reports/{report_id}/confirm-status` | Check if current user confirmed a report |

### Reports — Admin
| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/reports/` | Get all reports (paginated) |
| GET | `/reports/{report_id}` | Get a single report by ID |
| PUT | `/reports/{report_id}` | Update report status (admin) |
| DELETE | `/reports/{report_id}` | Delete a report (admin) |
| GET | `/api/admin/issues` | Get all issues with location data for map |
| GET | `/api/admin/issues/{report_id}` | Get single issue details |
| PATCH | `/api/admin/issues/{report_id}/status` | Update issue status |
| DELETE | `/api/admin/issues/{report_id}` | Delete an issue |

### Map
| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/admin/map/issues` | Get all issues with GPS coords, filterable by status/urgency |
| GET | `/api/admin/map/issues-in-bounds` | Get issues within geographic bounds (north/south/east/west) |
| GET | `/api/admin/map/stats` | Get map statistics (total, pending, in-progress, resolved) |

### Dashboard & Stats
| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/dashboard/summary` | Public stats: total reports, today's resolved, recent reports |
| GET | `/dashboard/stats` | Public stats: total, resolved, in-progress, category breakdown |
| GET | `/api/admin/dashboard/stats` | Admin stats: total, resolved, pending counts |
| GET | `/api/admin/dashboard/monthly-trends` | Monthly report counts for the last 6 months |
| GET | `/api/admin/dashboard/department-performance` | Department-wise resolved/total/progress data |
| GET | `/api/activity/today` | Today's public activity feed (new reports + resolved issues) |

### Departments
| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/departments/summary` | Summary stats for all departments (resolved, pending, efficiency) |
| GET | `/api/departments/resolution-trends` | Month-wise resolution efficiency per department |
| GET | `/api/departments/{dept_id}` | Detailed stats for a specific department |
| GET | `/api/departments/{dept_id}/status-breakdown` | Resolved/pending/in-progress breakdown for a department |
| GET | `/api/departments/{dept_id}/efficiency-trend` | Efficiency trend over N months for a department |
| GET | `/api/departments/issues/by-department` | Issue count per department (for bar chart) |
| POST | `/api/departments/feedback` | Submit feedback for a department |
| POST | `/api/departments/update-issues-status` | Bulk update issue statuses for a department |

### Notifications
| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/notifications` | Get all notifications for the current user |
| PATCH | `/api/notifications/{id}/read` | Mark a notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

### Super Admin — User Management
| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/super-admin/users` | List all users (filterable by role) |
| GET | `/api/super-admin/stats` | User count stats (total, super admins, dept admins, regular users) |
| PATCH | `/api/super-admin/users/{user_id}/role` | Change a user's role and department |
| DELETE | `/api/super-admin/users/{user_id}` | Delete a user |
| POST | `/api/super-admin/create-admin` | Create a new admin account |

### Misc / Utility
| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/` | Health check — returns welcome message |
| POST | `/init-db` | Initialize database with default categories, statuses, and admin user |
| POST | `/init-admins` | Create hardcoded super admin accounts |
| GET | `/urgency-levels` | Returns available urgency levels: High, Medium, Low |
| GET | `/categories` | Returns all issue categories |
| GET | `/statuses` | Returns all possible statuses |
| GET | `/reports/resolved/today` | Get all issues resolved today |
| GET | `/reports/{report_id}/confirmations` | Get confirmation count for a report (public) |
| GET | `/users/me/reports` | Get all reports submitted by the current user |
| GET | `/api/admin/profile` | Get admin profile by email |

---

## USER ROLES

| Role | Access |
|------|--------|
| `user` (Citizen) | Submit reports, view own reports, track status, confirm issues, manage profile |
| `dept_admin` | View and manage reports for their assigned department only, update status, upload completed work photos |
| `super_admin` | Full access — all reports, all departments, user management, priority control, export |

---

## AI FEATURES

The backend uses two AI models:

1. **Image Classifier** (`civic_eye_model.h5`) — Analyzes uploaded photos to detect the issue type (pothole, water leakage, garbage, streetlight, etc.) and maps it to the correct department.

2. **Text Classifier** (`text_classifier.pkl` + `tfidf_vectorizer.pkl`) — Predicts the department from text descriptions.

Both are used in the `/api/reports/smart` endpoint. The image model takes priority when an image is provided.
