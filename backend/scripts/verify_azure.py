"""
Quick verification script to check Azure resources
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

import psycopg2
from core.config import settings

print("=" * 60)
print("🔍 Verifying Azure Resources")
print("=" * 60)
print()

# Check 1: Configuration loaded
print("1️⃣ Configuration:")
print(f"   ✅ Database Host: {settings.DATABASE_URL.split('@')[1].split('/')[0]}")
print(f"   ✅ OpenAI Endpoint: {settings.AZURE_OPENAI_ENDPOINT}")
print(f"   ✅ Embedding Model: {settings.AZURE_OPENAI_EMBEDDING_MODEL}")
print(f"   ✅ Chat Model: {settings.AZURE_OPENAI_CHAT_MODEL}")
print()

# Check 2: Database Connection
print("2️⃣ Database Connection:")
try:
    conn = psycopg2.connect(settings.DATABASE_URL)
    cur = conn.cursor()
    print("   ✅ Connected to PostgreSQL!")
    
    # Check tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = [row[0] for row in cur.fetchall()]
    print(f"   ✅ Tables found: {', '.join(tables)}")
    
    # Check pgvector
    cur.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'")
    ext = cur.fetchone()
    if ext:
        print(f"   ✅ pgvector extension: Enabled (version {ext[1]})")
    else:
        print("   ⚠️  pgvector extension: Not found")
    
    # Check table counts
    for table in tables:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        print(f"   📊 {table}: {count} rows")
    
    conn.close()
    print()
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    print()

print("=" * 60)
print("✅ Verification Complete!")
print("=" * 60)
