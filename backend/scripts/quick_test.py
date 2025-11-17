"""Quick test for similarity detection"""
from utils.ai import get_embedding, find_similar_suggestions
from database.connection import SessionLocal

db = SessionLocal()

print("\n" + "="*60)
print("🧪 Testing AI Similarity Detection")
print("="*60)

# Test 1: Similar idea (should find match)
print("\n✅ Test 1: Similar idea")
test_query_1 = 'Better food at events'
emb_1 = get_embedding(test_query_1)
similar_1 = find_similar_suggestions(db, emb_1, 0.55, 5)

print(f'Query: "{test_query_1}"')
print(f'Found {len(similar_1)} similar suggestions:')
for i, s in enumerate(similar_1, 1):
    print(f'  {i}. {s["title"]}')
    print(f'     Similarity: {s["similarity"]*100:.1f}%')
    print(f'     Votes: {s["vote_count"]}')

# Test 2: New idea (should NOT find match)
print("\n✅ Test 2: New idea")
test_query_2 = 'Free Azure vouchers for students'
emb_2 = get_embedding(test_query_2)
similar_2 = find_similar_suggestions(db, emb_2, 0.55, 5)

print(f'Query: "{test_query_2}"')
if similar_2:
    print(f'Found {len(similar_2)} similar suggestions:')
    for i, s in enumerate(similar_2, 1):
        print(f'  {i}. {s["title"]} ({s["similarity"]*100:.1f}% match)')
else:
    print('✅ No similar suggestions - This is a NEW idea!')

print("\n" + "="*60)
print("🎉 Tests completed!")
print("="*60 + "\n")

db.close()
