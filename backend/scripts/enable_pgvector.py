"""
Enable pgvector extension on Azure PostgreSQL
Run this after enabling VECTOR in azure.extensions server parameter
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

import psycopg2
from core.config import settings

def enable_pgvector():
    """Enable pgvector extension"""
    try:
        print("=" * 60)
        print("🔧 Enabling pgvector Extension on Azure PostgreSQL")
        print("=" * 60)
        print()
        
        # Parse DATABASE_URL
        # postgresql://user:password@host:port/dbname?sslmode=require
        db_url = settings.DATABASE_URL
        
        print(f"📡 Connecting to database...")
        print(f"   Host: {db_url.split('@')[1].split(':')[0]}")
        print()
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✅ Connected successfully!")
        print()
        
        # Enable pgvector extension
        print("📦 Enabling pgvector extension...")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("✅ pgvector extension enabled!")
        print()
        
        # Verify extension
        print("🔍 Verifying extension...")
        cursor.execute("SELECT * FROM pg_extension WHERE extname = 'vector';")
        result = cursor.fetchone()
        
        if result:
            print("✅ pgvector is active!")
            print(f"   Extension Name: {result[0]}")
            print(f"   Extension Version: {result[1]}")
        else:
            print("⚠️  Extension created but verification failed")
        
        print()
        
        # Check available vector functions
        print("🛠️  Available vector functions:")
        cursor.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND data_type = 'vector'
            LIMIT 5;
        """)
        
        functions = cursor.fetchall()
        if functions:
            for func in functions:
                print(f"   - {func[0]}")
        
        cursor.close()
        conn.close()
        
        print()
        print("=" * 60)
        print("✅ pgvector Setup Complete!")
        print("=" * 60)
        print()
        print("Next step: Run database initialization")
        print("  python scripts\\init_db.py")
        print()
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database Error: {e}")
        print()
        print("Troubleshooting:")
        print()
        print("1. Make sure you enabled VECTOR in azure.extensions:")
        print("   - Go to Azure Portal")
        print("   - Open your PostgreSQL server (voteai)")
        print("   - Settings → Server parameters")
        print("   - Search for: azure.extensions")
        print("   - Enable: VECTOR")
        print("   - Click Save and wait 2-5 minutes")
        print()
        print("2. Check your DATABASE_URL in .env file")
        print()
        print("3. Verify your IP is allowed in Firewall rules")
        print()
        return False
        
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

if __name__ == "__main__":
    success = enable_pgvector()
    sys.exit(0 if success else 1)
