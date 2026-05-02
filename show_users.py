import sqlite3

conn = sqlite3.connect('career_path.db')
cursor = conn.cursor()

# Show table schema
print("=" * 50)
print("USERS TABLE SCHEMA")
print("=" * 50)
cursor.execute("PRAGMA table_info(users)")
for row in cursor.fetchall():
    col_id, name, dtype, not_null, default, pk = row
    constraints = []
    if not_null:
        constraints.append("NOT NULL")
    if pk:
        constraints.append("PRIMARY KEY")
    print(f"  {name} ({dtype}) {' '.join(constraints)}")

print()
print("=" * 50)
print("STORED USERS")
print("=" * 50)

try:
    cursor.execute("SELECT id, username, password_hash FROM users")
    users = cursor.fetchall()
    if users:
        for user in users:
            user_id, username, pw_hash = user
            print(f"\nUser ID: {user_id}")
            print(f"Username: {username}")
            print(f"Password Hash: {pw_hash[:60]}...")
            print(f"Hash Length: {len(pw_hash)} chars")
            print("-" * 50)
    else:
        print("No users registered yet.")
except Exception as e:
    print(f"Error: {e}")

# Also show user_progress table
print("\n" + "=" * 50)
print("USER PROGRESS TABLE")
print("=" * 50)
try:
    cursor.execute("SELECT * FROM user_progress LIMIT 5")
    progress = cursor.fetchall()
    if progress:
        for row in progress:
            print(f"Progress ID: {row[0]}, User ID: {row[1]}, Step: {row[2]}, Completed: {row[4]}")
    else:
        print("No progress data stored yet.")
except Exception as e:
    print(f"Error: {e}")

conn.close()
