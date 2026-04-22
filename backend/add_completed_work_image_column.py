"""
Migration script to add completed_work_images column to reports table.
Safe to run multiple times — checks before altering.
"""
import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'urban_db.sqlite3')

    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(reports)")
        columns = [col[1] for col in cursor.fetchall()]

        # Add completed_work_images (plural — JSON list of image paths)
        if 'completed_work_images' in columns:
            print("✅ Column 'completed_work_images' already exists")
        else:
            cursor.execute("""
                ALTER TABLE reports
                ADD COLUMN completed_work_images TEXT
            """)
            conn.commit()
            print("✅ Successfully added 'completed_work_images' column to reports table")

        # Also add priority column if missing
        if 'priority' in columns:
            print("✅ Column 'priority' already exists")
        else:
            cursor.execute("""
                ALTER TABLE reports
                ADD COLUMN priority VARCHAR(20) DEFAULT 'Normal'
            """)
            conn.commit()
            print("✅ Successfully added 'priority' column to reports table")

        # Verify
        cursor.execute("PRAGMA table_info(reports)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"\n📋 Current columns in reports table:\n  {', '.join(columns)}")

    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Running database migration...")
    migrate()
    print("\n✅ Migration complete!")
