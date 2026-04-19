"""
One-time migration: add missing columns to the users table.
Run with: python migrate_db.py
"""
import sqlite3

conn = sqlite3.connect("urban_db.sqlite3")
cur = conn.cursor()

migrations = [
    "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'",
    "ALTER TABLE users ADD COLUMN department VARCHAR(50)",
    "ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN locked_until DATETIME",
    "ALTER TABLE users ADD COLUMN fcm_token VARCHAR",
    "ALTER TABLE users ADD COLUMN reset_token VARCHAR",
    "ALTER TABLE users ADD COLUMN reset_token_expires DATETIME",
]

for sql in migrations:
    try:
        cur.execute(sql)
        print(f"OK:   {sql[:70]}")
    except sqlite3.OperationalError as e:
        print(f"SKIP: {e}")

# Promote existing is_admin=1 users to super_admin role
cur.execute("UPDATE users SET role = 'super_admin' WHERE is_admin = 1 AND role = 'user'")
print(f"Promoted {cur.rowcount} existing admin user(s) to super_admin role.")

conn.commit()

cur.execute("PRAGMA table_info(users)")
cols = [row[1] for row in cur.fetchall()]
print("\nFinal columns:", cols)

conn.close()
print("\nMigration complete.")
