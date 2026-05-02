import sqlite3
import os
from datetime import datetime, timedelta

DB_FILE = 'career_path.db'

def create_database():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create Scholarships Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scholarships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            eligibility TEXT NOT NULL,
            required_exam TEXT,
            deadline DATE NOT NULL,
            status TEXT NOT NULL
        )
    ''')

    # Create Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')

    # Create Progress Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS curr_roadmaps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            roadmap_json TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            step_id INTEGER NOT NULL,
            roadmap_id INTEGER NOT NULL,
            is_completed BOOLEAN NOT NULL DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(roadmap_id) REFERENCES curr_roadmaps(id)
        )
    ''')

    # Create Exams Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            eligibility TEXT NOT NULL,
            important_dates TEXT NOT NULL,
            difficulty TEXT NOT NULL
        )
    ''')

    # Seed data
    # Today is roughly 2026-04-02 based on system context
    today = datetime(2026, 4, 2)
    
    # 2 days from now (Urgent)
    date_urgent1 = (today + timedelta(days=2)).strftime('%Y-%m-%d')
    # 4 days from now (Warning)
    date_warning1 = (today + timedelta(days=4)).strftime('%Y-%m-%d')
    # 6 days from now (Warning)
    date_warning2 = (today + timedelta(days=6)).strftime('%Y-%m-%d')
    # 15 days from now (Info)
    date_info1 = (today + timedelta(days=15)).strftime('%Y-%m-%d')
    # 30 days from now (Info)
    date_info2 = (today + timedelta(days=30)).strftime('%Y-%m-%d')
    # Past (Expired)
    date_expired = (today - timedelta(days=5)).strftime('%Y-%m-%d')

    scholarships_data = [
        ('National Scholarship Portal (NSP)', '10th, 12th Pass', 'None', date_urgent1, 'Active'),
        ('KVPY Fellowship', '11th, 12th Science', 'KVPY Aptitude Test', date_warning1, 'Active'),
        ('Reliance Foundation Scholarship', 'Undergraduates', 'None', date_info1, 'Active'),
        ('NTSE Scholarship', '10th Standard', 'NTSE Exam', date_warning2, 'Active'),
        ('Tata Trusts Education Grants', '8th to College', 'None', date_info2, 'Active'),
        ('INSPIRE Scholarship', '12th Pass Science', 'None', date_expired, 'Expired')
    ]

    exams_data = [
        ('JEE Main', '12th Science (PCM)', 'Registration: Nov-Dec, Exam: Jan/Apr', 'High'),
        ('NEET UG', '12th Science (PCB)', 'Registration: Feb-Mar, Exam: May', 'High'),
        ('CUET UG', '12th Pass (Any Stream)', 'Registration: Feb-Mar, Exam: May', 'Medium'),
        ('UPSC NDA', '12th Pass (PCM for Air Force/Navy)', 'Registration: Jan, Exam: Apr', 'High'),
        ('CLAT', '12th Pass (Any Stream)', 'Registration: Aug-Nov, Exam: Dec', 'High'),
        ('CA Foundation', '12th Pass (Commerce priority)', 'Registration: Jan/Jul, Exam: May/Nov', 'High')
    ]

    cursor.executemany('''
        INSERT INTO scholarships (name, eligibility, required_exam, deadline, status)
        VALUES (?, ?, ?, ?, ?)
    ''', scholarships_data)

    cursor.executemany('''
        INSERT INTO exams (name, eligibility, important_dates, difficulty)
        VALUES (?, ?, ?, ?)
    ''', exams_data)

    conn.commit()
    conn.close()
    print("Database created and seeded successfully!")

if __name__ == '__main__':
    create_database()
