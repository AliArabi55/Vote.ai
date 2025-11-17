"""
Database Initialization Script
Run this to create all tables in your Azure PostgreSQL database
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from database.connection import Base, engine
from database.models import User, Suggestion, Vote

def init_database():
    """Create all database tables"""
    try:
        print("=" * 60)
        print("🔧 Initializing Vote.ai Database")
        print("=" * 60)
        print()
        
        print("📋 Creating tables...")
        print("   - users")
        print("   - suggestions")
        print("   - votes")
        print()
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        print()
        print("=" * 60)
        print("📊 Database Schema")
        print("=" * 60)
        print()
        print("Table: users")
        print("  - id (UUID, Primary Key)")
        print("  - email (String, Unique, Indexed)")
        print("  - full_name (String)")
        print("  - password_hash (String)")
        print("  - role (String)")
        print("  - created_at (Timestamp)")
        print()
        print("Table: suggestions")
        print("  - id (UUID, Primary Key)")
        print("  - user_id (UUID, Foreign Key → users)")
        print("  - title (String)")
        print("  - description (Text)")
        print("  - embedding (Vector[1536]) ← pgvector for AI")
        print("  - vote_count (Integer, Indexed)")
        print("  - status (String)")
        print("  - created_at (Timestamp)")
        print()
        print("Table: votes")
        print("  - user_id (UUID, Primary Key)")
        print("  - suggestion_id (UUID, Primary Key)")
        print("  - voted_at (Timestamp)")
        print()
        print("=" * 60)
        print("✅ Your database is ready to use!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        print()
        print("Troubleshooting:")
        print("1. Check your DATABASE_URL in .env file")
        print("2. Verify PostgreSQL server is running")
        print("3. Ensure pgvector extension is enabled")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
