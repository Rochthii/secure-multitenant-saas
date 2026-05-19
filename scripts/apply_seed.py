import psycopg2
import os

DB_CONNECTION = "postgresql://postgres:postgres@localhost:54322/postgres"
SQL_FILE = "supabase/migrations/20260417050000_seed_dharma_knowledge_base.sql"

def apply_sql():
    try:
        print(f"Reading SQL from {SQL_FILE}...")
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            sql = f.read()
            
        print("Connecting to database...")
        conn = psycopg2.connect(DB_CONNECTION)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Executing SQL seed...")
        cursor.execute(sql)
        
        # Check notices
        if conn.notices:
            for notice in conn.notices:
                print(notice.strip())
                
        print("DONE: Seed data applied successfully!")
        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    apply_sql()
