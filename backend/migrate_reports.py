"""
Migration: add missing columns to the reports table.
Run with: python migrate_reports.py
"""
import sqlite3

conn = sqlite3.connect("urban_db.sqlite3")
cur = conn.cursor()

# Get existing columns
cur.execute("PRAGMA table_info(reports)")
existing = {row[1] for row in cur.fetchall()}
print("Existing reports columns:", sorted(existing))

migrations = [
    ("confirmation_count", "ALTER TABLE reports ADD COLUMN confirmation_count INTEGER DEFAULT 0"),
]

for col, sql in migrations:
    if col in existing:
        print(f"SKIP: {col} already exists")
    else:
        cur.execute(sql)
        print(f"OK:   added {col}")

conn.commit()
conn.close()
print("\nMigration complete.")
