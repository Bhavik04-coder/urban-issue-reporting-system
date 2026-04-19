# UrbanSim AI

Urban Issue Reporting System with FastAPI backend and Flutter mobile app featuring GPS location capture, interactive maps, and strong password security.

## Quick Start

**Run the application:**
```bash
start.bat
```

This will:
- Install dependencies (first time only)
- Start the backend server on http://localhost:8000
- Launch the Flutter app in Chrome

**Important for Web**: When running on Chrome, you'll need to:
1. Allow location permission when prompted by the browser
2. Add Google Maps API key to `flutter_app/web/index.html` (see setup below)

**For Mobile**: Run on Android/iOS device for full GPS functionality:
```bash
cd flutter_app
flutter run
```

## Login Credentials

### Regular User (Test Account)
- **Email**: `user@example.com`
- **Password**: `user123`

### Admin Accounts

#### Super Admin 1 - Atharv Mulik
- **Email**: `atharv@urbansim.com`
- **Password**: `Admin@1234`
- **Role**: Super Administrator
- **Admin ID**: ADM-2024-001
- **Contact**: +91 9876543210
- **Permissions**: Full system access, user management, all departments

#### Super Admin 2 - Siddhi Naik
- **Email**: `siddhi@urbansim.com`
- **Password**: `Admin@1234`
- **Role**: Super Administrator
- **Admin ID**: ADM-2024-002
- **Contact**: +91 9123456780
- **Permissions**: Full system access, user management, all departments

**Note**: Admin accounts have elevated privileges including:
- View and manage all reports across departments
- Access to analytics and statistics dashboard
- User management capabilities
- System configuration access

## Features

### Core Features
- Report civic issues with photos
- GPS location capture with automatic address lookup
- Track issue status in real-time
- AI-powered department assignment
- User profile management
- **Delete your own reports** - Users can delete reports they've submitted

### Admin Features
- Interactive map view showing all reported issues
- Color-coded markers by status and urgency
- Filter issues by status and urgency level
- Real-time statistics dashboard
- Department performance analytics
- Delete any report (admin privilege)

### Security Features
- Strong password policy with validation
- Real-time password strength indicator
- Secure authentication with JWT tokens

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Python 3.9+
- Frontend: Flutter 3.0+, Dart
- Database: SQLite
- AI: TensorFlow, scikit-learn
- Maps: Google Maps Flutter
- Location: Geolocator, Geocoding

---

## 🗑️ Delete Reports Feature

### User Delete (Own Reports Only)

Users can delete reports they have submitted:

**How to Delete:**
1. Go to "My Issues" tab (bottom navigation)
2. Find the report you want to delete
3. **Option 1**: Tap the red delete icon (🗑️) on the right side of the report card
4. **Option 2**: Long press on the report card
5. Confirm deletion in the dialog
6. Report is permanently deleted

**Important Notes:**
- ✅ You can only delete your own reports
- ✅ Deletion is permanent and cannot be undone
- ✅ All associated data (images, confirmations) is removed
- ❌ You cannot delete reports created by other users
- ❌ Once deleted, the report cannot be recovered

**Security:**
- Backend validates that you own the report before deletion
- Unauthorized deletion attempts are blocked
- JWT authentication required

### Admin Delete (All Reports)

Admins can delete any report in the system:

**How to Delete (Admin):**
1. Login as admin
2. Go to Admin Dashboard
3. Navigate to Reports tab
4. Find the report to delete
5. Tap delete button
6. Confirm deletion

**Admin Permissions:**
- ✅ Can delete any report regardless of owner
- ✅ Can delete reports from any department
- ✅ Full access to all report management features

---

## 📍 Location Capture & Map Features

### GPS Location Capture (Issue Report Form)

Users can automatically capture their current location when reporting issues:

**Features:**
- Auto-detect location with GPS button
- Reverse geocoding (converts coordinates to readable address)
- Manual entry option still available
- Visual feedback showing captured coordinates
- Proper permission handling for Android and iOS

**How to Use:**
1. Open "Report an Issue" form
2. Tap the GPS icon (📍) next to the location field
3. Grant location permissions when prompted
4. Location and address are automatically filled

### Admin Map View

Interactive map showing all reported issues with visual markers:

**Features:**
- Color-coded markers:
  - 🟢 Green: Resolved issues
  - 🔴 Red: High urgency issues
  - 🟠 Orange: Medium urgency issues
  - 🔵 Blue: Low urgency/Pending issues
- Filter by status (Pending, In Progress, Resolved)
- Filter by urgency level (Low, Medium, High)
- Tap markers to view full issue details
- Statistics overlay (total, pending, resolved counts)
- Refresh button for latest data

**How to Access:**
1. Login as admin
2. Navigate to Admin Dashboard
3. Tap "View Issues on Map" button

### Google Maps API Setup (Required for Production)

To use Google Maps in production, you need an API key:

#### Get Your API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
4. Go to "Credentials" and create an API key
5. Restrict the API key for security

#### Add API Key to Your App:

**Android** - Edit `flutter_app/android/app/src/main/AndroidManifest.xml`:
```xml
<application>
    <!-- Add this inside <application> tag -->
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="YOUR_ANDROID_API_KEY_HERE"/>
</application>
```

**iOS** - Edit `flutter_app/ios/Runner/AppDelegate.swift`:
```swift
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_IOS_API_KEY_HERE")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

#### Testing Without API Key:
- Map will work with "For development purposes only" watermark
- Some features may be rate-limited
- Production deployment requires valid API key

#### Cost Considerations:
- Google Maps offers $200 free credit per month
- Pay-as-you-go pricing after free tier
- Monitor usage in Google Cloud Console

### Permissions (Already Configured)

**Android** (`AndroidManifest.xml`):
- `ACCESS_FINE_LOCATION` - GPS location
- `ACCESS_COARSE_LOCATION` - Network location
- `INTERNET` - Map tiles and geocoding

**iOS** (`Info.plist`):
- `NSLocationWhenInUseUsageDescription` - Location permission message

### Configuration Notes

- Default map location: Delhi, India (28.6139, 77.2090)
- To change: Update `_defaultLocation` in `flutter_app/lib/screens/admin_map_screen.dart`
- Map only shows issues with valid latitude/longitude coordinates
- Internet connection required for map tiles and geocoding

---

## 🔒 Strong Password Policy

### Password Requirements

All new user registrations must have passwords meeting these criteria:

1. ✅ **Minimum 8 characters**
2. ✅ **At least one uppercase letter** (A-Z)
3. ✅ **At least one lowercase letter** (a-z)
4. ✅ **At least one number** (0-9)
5. ✅ **At least one special character** (!@#$%^&*(),.?":{}|<>_-+=[]\/~`)

### Valid Password Examples

- `MyPass123!` ✅
- `Secure@2024` ✅
- `Admin#Pass99` ✅
- `Test$User1` ✅
- `Strong&Pass2024` ✅

### Invalid Password Examples

- `password` ❌ - No uppercase, no numbers, no special chars
- `PASSWORD123` ❌ - No lowercase, no special chars
- `MyPassword` ❌ - No numbers, no special chars
- `Pass123` ❌ - Too short, no special chars
- `MyPass!` ❌ - No numbers

### Password Strength Indicator

During signup, users see real-time feedback:

**Strength Levels:**
- 🔴 **Weak** (0-2 requirements met)
- 🟠 **Fair** (3 requirements met)
- 🔵 **Good** (4 requirements met)
- 🟢 **Strong** (all 5 requirements met)

**Visual Feedback:**
- Progress bar showing strength percentage
- Color-coded strength label
- Checklist with ✓/✗ for each requirement
- Specific error messages for missing requirements

### Password Validation Examples

**Weak Password:**
```
Password: password
Strength: [████░░░░░░] Weak

✗ At least 8 characters
✗ Uppercase letter (A-Z)
✓ Lowercase letter (a-z)
✗ Number (0-9)
✗ Special character (!@#$%...)
```

**Strong Password:**
```
Password: MyPass123!
Strength: [██████████] Strong

✓ At least 8 characters
✓ Uppercase letter (A-Z)
✓ Lowercase letter (a-z)
✓ Number (0-9)
✓ Special character (!@#$%...)
```

### Tips for Creating Strong Passwords

1. **Use a Passphrase**: `ILove2Code!` (easy to remember)

2. **Substitute Characters**:
   - `a` → `@`, `e` → `3`, `i` → `!`, `o` → `0`, `s` → `$`
   - Example: `P@$$w0rd!23`

3. **Combine Words with Numbers and Symbols**:
   - `Blue$Sky2024`
   - `Coffee&Code99`

4. **Use First Letters of a Sentence**:
   - "I love to code in 2024!" → `Iltc!n2024`

5. **Password Manager**: Generate complex passwords like `Kx9#mP2$vL4@qR7!`

### Security Benefits

- **Brute Force Protection**: Exponentially harder to crack
- **Dictionary Attack Prevention**: Special characters prevent common word attacks
- **Credential Stuffing Defense**: Unique passwords reduce breach risk
- **Compliance**: Meets OWASP, NIST, PCI DSS standards

### Implementation Notes

- **Frontend**: Real-time validation in signup form only
- **Backend**: Server-side validation prevents weak passwords
- **Login**: No validation (allows existing users with old passwords)
- **Error Messages**: Specific feedback for each unmet requirement

---

## Troubleshooting

Visit http://localhost:8000/docs after starting the backend.

### Location Not Working?

**On Web (Chrome)**:
1. Click the location icon in browser address bar
2. Select "Allow" for location access
3. Refresh and try again

**On Mobile**:
1. Enable Location Services in device settings
2. Grant app location permission
3. Ensure GPS is enabled

**Common Issues**:
- "Location permission denied" → Grant permission in browser/device settings
- "Location services disabled" → Enable GPS in device settings
- Map shows blank → Add Google Maps API key (see setup above)

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Quick Fixes:

```bash
# Clean and rebuild
cd flutter_app
flutter clean
flutter pub get
flutter run

# Check Flutter setup
flutter doctor -v
```

---

## API Documentation

Visit http://localhost:8000/docs after starting the backend.

### Key Endpoints

**Authentication:**
- `POST /api/users/register` - User registration with strong password
- `POST /api/login` - User login

**Reports:**
- `POST /api/reports/` - Create report with GPS coordinates
- `GET /api/users/reports/filtered` - Get user's reports

**Admin - Map:**
- `GET /api/admin/map/issues` - Get all issues with coordinates
- `GET /api/admin/map/issues-in-bounds` - Get issues in map bounds
- `GET /api/admin/map/stats` - Get map statistics

**Admin - Dashboard:**
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/department-performance` - Department analytics

---

## Project Structure

```
urban-sim-ai/
├── backend/
│   ├── app/
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas with validation
│   │   ├── database.py        # Database configuration
│   │   └── auth_utils.py      # Authentication utilities
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── urban_db.sqlite3       # SQLite database
│
├── flutter_app/
│   ├── lib/
│   │   ├── screens/
│   │   │   ├── login_screen.dart           # Login/Signup with password validation
│   │   │   ├── issue_report_screen.dart    # Report form with GPS capture
│   │   │   ├── admin_dashboard_screen.dart # Admin dashboard
│   │   │   └── admin_map_screen.dart       # Interactive map view
│   │   ├── providers/
│   │   │   └── auth_provider.dart          # Authentication state
│   │   └── config/
│   │       └── api_config.dart             # API endpoints
│   ├── android/                            # Android configuration
│   ├── ios/                                # iOS configuration
│   └── pubspec.yaml                        # Flutter dependencies
│
├── start.bat                  # Windows startup script
└── README.md                  # This file
```

---

## Dependencies

### Backend (Python)
- FastAPI - Web framework
- SQLAlchemy - ORM
- Pydantic - Data validation
- TensorFlow - AI predictions
- scikit-learn - Text classification
- python-jose - JWT tokens
- passlib - Password hashing

### Frontend (Flutter)
- provider - State management
- http - API calls
- shared_preferences - Local storage
- geolocator - GPS location
- geocoding - Address lookup
- google_maps_flutter - Map display
- image_picker - Photo upload

---

## Development

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Flutter Setup
```bash
cd flutter_app
flutter pub get
flutter run -d chrome  # For web
flutter run            # For mobile
```

### Database
- SQLite database: `backend/urban_db.sqlite3`
- Auto-created on first run
- Includes sample data for testing

---

## Testing

### Test Location Capture:
1. Open "Report an Issue"
2. Tap GPS icon next to location field
3. Grant location permissions
4. Verify coordinates and address captured

### Test Map View:
1. Login as admin (`admin@example.com` / `admin123`)
2. Go to Admin Dashboard
3. Tap "View Issues on Map"
4. Verify markers appear
5. Test filtering by status and urgency
6. Tap markers to view details

### Test Password Validation:
1. Go to signup page
2. Try weak passwords (e.g., `password`)
3. Verify error messages appear
4. Watch strength indicator update
5. Try strong password (e.g., `MyPass123!`)
6. Verify registration succeeds

---

## Troubleshooting

### Map Issues

**Blank/gray tiles:**
- Check if API key is correctly added
- Verify Maps SDK is enabled in Google Cloud Console
- Check internet connection

**"API key not found" error:**
- Ensure API key is in correct file
- Rebuild app after adding key
- Check for typos

**Permission errors:**
- Verify location permissions granted
- Check AndroidManifest.xml and Info.plist

### Location Issues

**"Location services disabled":**
- Enable GPS on device
- Grant location permissions to app

**"Permission denied":**
- Go to device settings
- Enable location permission for app

### Password Issues

**"Password too weak" error:**
- Ensure password meets all 5 requirements
- Check password strength indicator
- Try example: `MyPass123!`

**Backend validation error:**
- Check backend logs for specific error
- Verify password meets server-side requirements

---

## Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Passwords**: Use strong passwords meeting all requirements
3. **Tokens**: JWT tokens expire after 30 days
4. **HTTPS**: Use HTTPS in production
5. **Permissions**: Request only necessary permissions

---

## Future Enhancements

- [ ] Password history (prevent reusing passwords)
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] Account lockout after failed attempts
- [ ] Offline mode for reports
- [ ] Push notifications for status updates
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export reports to PDF
- [ ] Advanced analytics dashboard

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
- Check API documentation: http://localhost:8000/docs
- Review this README
- Check troubleshooting section

---

## Contributors

Built with ❤️ for better civic management
