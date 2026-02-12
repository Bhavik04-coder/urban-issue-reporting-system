# init_tables.py
import asyncio
import os
from dotenv import load_dotenv
from app.database import engine, Base
from app.models import User, Category, Status
from app.auth_utils import get_password_hash

async def init_tables():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully!")

async def init_data():
    from app.database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as session:
        # Create default categories
        categories = [
            Category(name="Infrastructure", description="Roads, bridges, public facilities"),
            Category(name="Sanitation", description="Waste management, cleanliness"),
            Category(name="Public Safety", description="Safety and security issues"),
            Category(name="Utilities", description="Water, electricity, gas services"),
            Category(name="Environment", description="Parks, pollution, green spaces"),
        ]
        
        for category in categories:
            # Check if category already exists
            from sqlalchemy import select
            result = await session.execute(select(Category).where(Category.name == category.name))
            existing = result.scalar_one_or_none()
            
            if not existing:
                session.add(category)
                print(f"✅ Added category: {category.name}")
        
        # Create default statuses
        statuses = [
            Status(name="Reported", description="Issue has been reported"),
            Status(name="In Progress", description="Issue is being addressed"),
            Status(name="Resolved", description="Issue has been resolved"),
            Status(name="Closed", description="Issue has been closed"),
        ]
        
        for status in statuses:
            result = await session.execute(select(Status).where(Status.name == status.name))
            existing = result.scalar_one_or_none()
            
            if not existing:
                session.add(status)
                print(f"✅ Added status: {status.name}")
        
        # Create admin user
        result = await session.execute(select(User).where(User.email == "admin@urbanissues.com"))
        existing_user = result.scalar_one_or_none()
        
        if not existing_user:
            admin_user = User(
                email="admin@urbanissues.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrator",
                is_admin=True
            )
            session.add(admin_user)
            print("✅ Added admin user")
        
        await session.commit()
        print("🎉 Database initialization completed successfully!")
        print("📧 Admin credentials: email=admin@urbanissues.com, password=admin123")

async def main():
    load_dotenv()
    await init_tables()
    await init_data()

if __name__ == "__main__":
    asyncio.run(main())