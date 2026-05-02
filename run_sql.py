import sqlite3

def run_sql_query(query):
    conn = sqlite3.connect('career_path.db')
    conn.row_factory = sqlite3.Row  # Allows accessing columns by name
    cursor = conn.cursor()
    
    try:
        cursor.execute(query)
        
        # If SELECT query, show results
        if query.strip().upper().startswith('SELECT'):
            rows = cursor.fetchall()
            if rows:
                # Print column headers
                headers = rows[0].keys()
                print(" | ".join(headers))
                print("-" * 60)
                
                # Print rows
                for row in rows:
                    values = [str(row[col]) for col in headers]
                    print(" | ".join(values))
                print(f"\nTotal rows: {len(rows)}")
            else:
                print("No results found.")
        else:
            conn.commit()
            print(f"Query executed successfully. Rows affected: {cursor.rowcount}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    # Example queries - modify these!
    
    print("=== TABLE LIST ===")
    run_sql_query("SELECT name FROM sqlite_master WHERE type='table'")
    
    print("\n=== USERS ===")
    run_sql_query("SELECT id, username FROM users")
    
    print("\n=== SCHOLARSHIPS ===")
    run_sql_query("SELECT id, name, deadline, status FROM scholarships LIMIT 5")
    
    print("\n=== EXAMS ===")
    run_sql_query("SELECT id, name, difficulty FROM exams")
    
    # You can add your own queries here:
    # print("\n=== CUSTOM QUERY ===")
    # run_sql_query("SELECT * FROM user_progress")
