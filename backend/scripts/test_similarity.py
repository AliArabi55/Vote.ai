"""
Test Script for AI Similarity Detection
This script tests the check-similarity endpoint to ensure it works correctly
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai import get_embedding, find_similar_suggestions
from database.connection import SessionLocal

def test_similarity():
    """Test the similarity detection functionality"""
    print("🧪 Testing AI Similarity Detection...")
    print("=" * 60)
    
    # Test 1: Generate embedding
    print("\n1️⃣ Testing Embedding Generation...")
    test_text = "Better food options at events"
    try:
        embedding = get_embedding(test_text)
        print(f"✅ Embedding generated successfully!")
        print(f"   Vector dimensions: {len(embedding)}")
        print(f"   Sample values: {embedding[:5]}")
    except Exception as e:
        print(f"❌ Embedding generation failed: {e}")
        return
    
    # Test 2: Find similar suggestions
    print("\n2️⃣ Testing Similarity Search...")
    db = SessionLocal()
    try:
        similar = find_similar_suggestions(
            db,
            embedding,
            threshold=0.80,
            limit=5
        )
        
        if similar:
            print(f"✅ Found {len(similar)} similar suggestions:")
            for i, suggestion in enumerate(similar, 1):
                similarity_percent = suggestion['similarity'] * 100
                print(f"\n   {i}. {suggestion['title']}")
                print(f"      Similarity: {similarity_percent:.1f}%")
                print(f"      Votes: {suggestion['vote_count']}")
        else:
            print("ℹ️  No similar suggestions found (this is normal if database is empty)")
            
    except Exception as e:
        print(f"❌ Similarity search failed: {e}")
    finally:
        db.close()
    
    # Test 3: Test with new idea
    print("\n3️⃣ Testing with New Idea...")
    new_text = "Free Azure vouchers for everyone"
    try:
        new_embedding = get_embedding(new_text)
        db = SessionLocal()
        similar = find_similar_suggestions(
            db,
            new_embedding,
            threshold=0.80,
            limit=5
        )
        
        if similar:
            print(f"⚠️  Found {len(similar)} similar suggestions for '{new_text}'")
        else:
            print(f"✅ No similar suggestions found - this is a NEW idea!")
        
        db.close()
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Test completed!")

if __name__ == "__main__":
    test_similarity()
