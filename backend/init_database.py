# init_database.py
import asyncio
import sys
import os

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import init_db, get_sync_session, engine
from app.models import User, Category, Status
from app.auth_utils import get_password_hash

async def initialize_database_async():
    # Create all tables
    await init_db()
    
    # Create a synchronous session for data population
    session = get_sync_session()
    
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
            if not session.query(Category).filter(Category.name == category.name).first():
                session.add(category)
        
        # Create default statuses if they don't exist
        statuses = [
            Status(name="Reported", description="Issue has been reported"),
            Status(name="In Progress", description="Issue is being addressed"),
            Status(name="Resolved", description="Issue has been resolved"),
            Status(name="Closed", description="Issue has been closed"),
        ]
        
        for status in statuses:
            if not session.query(Status).filter(Status.name == status.name).first():
                session.add(status)
        
        # Create admin user if it doesn't exist
        if not session.query(User).filter(User.email == "admin@urbanissues.com").first():
            admin_user = User(
                email="admin@urbanissues.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrator",
                is_admin=True
            )
            session.add(admin_user)
        
        # Commit changes
        session.commit()
        
        print("Database initialized successfully!")
        print("Default admin user created: email=admin@urbanissues.com, password=admin123")
        
    except Exception as e:
        session.rollback()
        print(f"Error initializing database: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    asyncio.run(initialize_database_async())