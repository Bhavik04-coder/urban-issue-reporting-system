import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_database():
    # Get database URL from environment or use default
    database_url = os.getenv('DATABASE_URL', 'postgresql+asyncpg://postgres:password@localhost:5432/urban_db')
    
    # Extract connection details
    if 'postgresql+asyncpg://' in database_url:
        database_url = database_url.replace('postgresql+asyncpg://', 'postgresql://')
    
    try:
        # Connect directly using asyncpg
        conn = await asyncpg.connect(database_url)
        
        print("🔄 Adding AI Department Assignment columns to reports table...")
        
        # Add the 3 CRITICAL columns for AI department assignment
        await conn.execute("""
            ALTER TABLE reports 
            ADD COLUMN IF NOT EXISTS department VARCHAR DEFAULT 'other',
            ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS prediction_confidence FLOAT;
        """)
        
        print("✅ AI Department Assignment columns added successfully!")
        print("📊 Columns added:")
        print("   - department (VARCHAR) - Default: 'other'")
        print("   - auto_assigned (BOOLEAN) - Default: false") 
        print("   - prediction_confidence (FLOAT) - AI confidence score")
        
        # Optional: Verify the columns were added
        columns = await conn.fetch("""
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'reports' 
            AND column_name IN ('department', 'auto_assigned', 'prediction_confidence');
        """)
        
        print("\n📋 Verification - Added columns:")
        for col in columns:
            print(f"   - {col['column_name']}: {col['data_type']} (Default: {col['column_default']})")
        
        await conn.close()
        
        print("\n🎯 Database is now ready for AI Department Assignment!")
        print("🚀 You can now submit reports with automatic department assignment!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_database())