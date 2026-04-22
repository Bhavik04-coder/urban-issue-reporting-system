"""
Seed one admin per department into the database.
Run with: python seed_dept_admins.py
"""
import asyncio
import sys
sys.path.insert(0, ".")

from app.database import AsyncSessionLocal
from app.models import User
from app.auth_utils import get_password_hash
from sqlalchemy.future import select

DEPT_ADMINS = [
    {"email": "water@urbansim.com",      "full_name": "Water Dept Admin",      "mobile": "9000000001", "department": "water_dept"},
    {"email": "road@urbansim.com",        "full_name": "Road Dept Admin",        "mobile": "9000000002", "department": "road_dept"},
    {"email": "sanitation@urbansim.com",  "full_name": "Sanitation Dept Admin",  "mobile": "9000000003", "department": "sanitation_dept"},
    {"email": "electricity@urbansim.com", "full_name": "Electricity Dept Admin", "mobile": "9000000004", "department": "electricity_dept"},
]

PASSWORD = "Dept@1234"


async def seed():
    async with AsyncSessionLocal() as db:
        for a in DEPT_ADMINS:
            res = await db.execute(select(User).where(User.email == a["email"]))
            existing = res.scalar_one_or_none()
            if existing:
                existing.role = "dept_admin"
                existing.is_admin = True
                existing.department = a["department"]
                print(f"Updated: {a['email']}")
            else:
                user = User(
                    email=a["email"],
                    hashed_password=get_password_hash(PASSWORD),
                    full_name=a["full_name"],
                    mobile_number=a["mobile"],
                    is_admin=True,
                    role="dept_admin",
                    department=a["department"],
                )
                db.add(user)
                print(f"Created: {a['email']}")
        await db.commit()
    print(f"\nDone. Password for all dept admins: {PASSWORD}")


asyncio.run(seed())
