from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from gemini_helper import generate_career_roadmap, generate_chat_response

app = Flask(__name__)
CORS(app)

DB_FILE = 'career_path.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login-portal')
def login_page():
    return render_template('login.html')

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    conn = get_db_connection()
    try:
        pw_hash = generate_password_hash(password)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, pw_hash))
        conn.commit()
        user_id = cursor.lastrowid
        return jsonify({"success": True, "message": "User created", "user_id": user_id, "username": username})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({"success": True, "message": "Login successful", "user_id": user['id'], "username": user['username']})
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/save-progress', methods=['POST'])
def save_progress():
    data = request.json
    user_id = data.get('user_id')
    step_id = data.get('step_id')
    is_completed = data.get('is_completed')
    
    if not user_id or step_id is None:
        return jsonify({"error": "Missing fields"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    existing = cursor.execute("SELECT id FROM user_progress WHERE user_id = ? AND step_id = ?", (user_id, step_id)).fetchone()
    if existing:
        cursor.execute("UPDATE user_progress SET is_completed = ? WHERE id = ?", (is_completed, existing['id']))
    else:
        cursor.execute("INSERT INTO user_progress (user_id, step_id, roadmap_id, is_completed) VALUES (?, ?, 0, ?)", (user_id, step_id, is_completed))
    
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/get-progress', methods=['GET'])
def get_progress():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
        
    conn = get_db_connection()
    progress = conn.execute("SELECT step_id, is_completed FROM user_progress WHERE user_id = ?", (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in progress])

@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    stage = data.get('stage')
    interests = data.get('interests')
    goal = data.get('goal')
    
    if not stage or not interests or not goal:
        return jsonify({"error": "Missing required fields (stage, interests, goal)."}), 400
        
    roadmap_result = generate_career_roadmap(stage, interests, goal)
    return jsonify(roadmap_result)

@app.route('/scholarships', methods=['GET'])
def get_scholarships():
    conn = get_db_connection()
    scholarships = conn.execute('SELECT * FROM scholarships').fetchall()
    conn.close()
    
    return jsonify([dict(ix) for ix in scholarships])

@app.route('/exams', methods=['GET'])
def get_exams():
    conn = get_db_connection()
    exams = conn.execute('SELECT * FROM exams').fetchall()
    conn.close()
    
    return jsonify([dict(ix) for ix in exams])

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    message = data.get('message')
    context = data.get('context')
    
    if not message:
        return jsonify({"error": "Message is required."}), 400
        
    response_text = generate_chat_response(context, message)
    return jsonify({"response": response_text})

if __name__ == '__main__':
    app.run(debug=True, port=5005)
