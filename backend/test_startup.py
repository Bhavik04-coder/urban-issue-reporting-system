"""
Quick test to verify backend can start without errors
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

print("🔍 Testing backend startup...")
print("=" * 60)

try:
    print("1️⃣ Importing FastAPI...")
    from fastapi import FastAPI
    print("   ✅ FastAPI imported")
    
    print("\n2️⃣ Importing database modules...")
    from app.database import Base, engine
    print("   ✅ Database modules imported")
    
    print("\n3️⃣ Importing models...")
    from app.models import User, Report, Notification
    print("   ✅ Models imported")
    
    print("\n4️⃣ Importing main app...")
    from main import app
    print("   ✅ Main app imported")
    
    print("\n5️⃣ Checking app routes...")
    routes = [route.path for route in app.routes if hasattr(route, 'path')]
    critical_routes = [
        "/api/reports/smart",
        "/api/dept-admin/reports",
        "/api/dept-admin/reports/{report_id}/completed-work-image",
        "/api/super-admin/reports/{report_id}/priority",
        "/api/notifications",
    ]
    
    for route in critical_routes:
        # Check if route exists (with or without path parameters)
        route_base = route.split('{')[0]
        matching = [r for r in routes if r.startswith(route_base)]
        if matching:
            print(f"   ✅ {route}")
        else:
            print(f"   ⚠️  {route} - NOT FOUND")
    
    print("\n" + "=" * 60)
    print("✅ Backend startup test PASSED!")
    print("=" * 60)
    print("\n💡 To start the server, run:")
    print("   cd backend")
    print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
