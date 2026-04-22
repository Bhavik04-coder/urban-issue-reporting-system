"""
Migration: Add status_history column to reports table.
Run once: python add_status_history_column.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "urban_db.sqlite3")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if column already exists
    cursor.execute("PRAGMA table_info(reports)")
    columns = [row[1] for row in cursor.fetchall()]

    if "status_history" not in columns:
        cursor.execute("ALTER TABLE reports ADD COLUMN status_history TEXT")
        conn.commit()
        print("✅ Added 'status_history' column to reports table.")
    else:
        print("ℹ️  Column 'status_history' already exists — skipping.")

    conn.close()

if __name__ == "__main__":
    migrate()
