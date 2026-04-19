"""
Seed the two real admin users into the database.
Run with: python seed_admins.py
"""
import asyncio
import sys
sys.path.insert(0, ".")

from app.database import AsyncSessionLocal
from app.models import User
from app.auth_utils import get_password_hash
from sqlalchemy.future import select

ADMINS = [
    {"email": "atharv@urbansim.com", "full_name": "Atharv Mulik", "mobile": "9876543210"},
    {"email": "siddhi@urbansim.com",  "full_name": "Siddhi Naik",  "mobile": "9123456780"},
]

# Default password — admins should change this after first login
DEFAULT_PASSWORD = "Admin@1234"


async def seed():
    async with AsyncSessionLocal() as db:
        for a in ADMINS:
            res = await db.execute(select(User).where(User.email == a["email"]))
            existing = res.scalar_one_or_none()
            if existing:
                # Make sure role is correct even if user already existed
                existing.role = "super_admin"
                existing.is_admin = True
                print(f"Updated role for existing user: {a['email']}")
            else:
                user = User(
                    email=a["email"],
                    hashed_password=get_password_hash(DEFAULT_PASSWORD),
                    full_name=a["full_name"],
                    mobile_number=a["mobile"],
                    is_admin=True,
                    role="super_admin",
                )
                db.add(user)
                print(f"Created admin: {a['email']}")
        await db.commit()
    print(f"\nDone. Default password: {DEFAULT_PASSWORD}")
    print("Please change passwords after first login.")


asyncio.run(seed())
