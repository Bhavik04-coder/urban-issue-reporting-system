"""
Verify database schema for reports table
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "urban_db.sqlite3")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Check tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("📋 Tables in database:")
for table in tables:
    print(f"  - {table}")

# Check reports table schema
if "reports" in tables:
    print("\n📊 Reports table schema:")
    cur.execute("PRAGMA table_info(reports)")
    columns = cur.fetchall()
    for col in columns:
        col_id, name, col_type, not_null, default, pk = col
        print(f"  {name:30} {col_type:15} {'NOT NULL' if not_null else ''} {f'DEFAULT {default}' if default else ''}")
    
    # Check for critical columns
    col_names = [c[1] for c in columns]
    critical_cols = ['priority', 'completed_work_images', 'images', 'user_id', 'department']
    print("\n✅ Critical columns check:")
    for col in critical_cols:
        status = "✓" if col in col_names else "✗ MISSING"
        print(f"  {col:30} {status}")

# Check notifications table
if "notifications" in tables:
    print("\n📬 Notifications table exists: ✓")
    cur.execute("SELECT COUNT(*) FROM notifications")
    count = cur.fetchone()[0]
    print(f"  Total notifications: {count}")

conn.close()
print("\n✅ Schema verification complete")
