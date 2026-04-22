"""
One-time migration: add missing columns to existing tables.
Run with: python add_priority_column.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "urban_db.sqlite3")

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def table_exists(cursor, table):
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
    return cursor.fetchone() is not None

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# ── reports.priority ─────────────────────────────────────────────────────────
if not column_exists(cur, "reports", "priority"):
    cur.execute("ALTER TABLE reports ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'Normal'")
    print("✅ Added reports.priority")
else:
    print("ℹ️  reports.priority already exists")

# ── reports.completed_work_images ────────────────────────────────────────────
if not column_exists(cur, "reports", "completed_work_images"):
    cur.execute("ALTER TABLE reports ADD COLUMN completed_work_images TEXT")
    print("✅ Added reports.completed_work_images")
else:
    print("ℹ️  reports.completed_work_images already exists")

# ── notifications table ───────────────────────────────────────────────────────
if not table_exists(cur, "notifications"):
    cur.execute("""
        CREATE TABLE notifications (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER REFERENCES users(id),
            report_id   INTEGER REFERENCES reports(id),
            title       VARCHAR(255) NOT NULL,
            message     TEXT NOT NULL,
            notif_type  VARCHAR(50) DEFAULT 'info',
            is_read     BOOLEAN DEFAULT 0,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("CREATE INDEX ix_notifications_user_id ON notifications(user_id)")
    print("✅ Created notifications table")
else:
    print("ℹ️  notifications table already exists")

conn.commit()
conn.close()
print("\nMigration complete.")
