import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def check_tables():
    database_url = os.getenv('DATABASE_URL', 'postgresql+asyncpg://postgres:password@localhost:5432/urban_db')
    
    if 'postgresql+asyncpg://' in database_url:
        database_url = database_url.replace('postgresql+asyncpg://', 'postgresql://')
    
    try:
        conn = await asyncpg.connect(database_url)
        
        print("📊 Checking categories table...")
        categories = await conn.fetch("SELECT * FROM categories ORDER BY id")
        print("Categories:")
        for row in categories:
            print(f"  {row['id']}: {row['name']}")
        
        print("\n📊 Checking statuses table...")
        statuses = await conn.fetch("SELECT * FROM statuses ORDER BY id")
        print("Statuses:")
        for row in statuses:
            print(f"  {row['id']}: {row['name']}")
        
        print("\n📊 Checking reports table categories...")
        report_categories = await conn.fetch("SELECT DISTINCT category FROM reports")
        print("Unique categories in reports:")
        for row in report_categories:
            print(f"  - {row['category']}")
        
        print("\n📊 Checking reports table statuses...")
        report_statuses = await conn.fetch("SELECT DISTINCT status FROM reports")
        print("Unique statuses in reports:")
        for row in report_statuses:
            print(f"  - {row['status']}")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_tables())