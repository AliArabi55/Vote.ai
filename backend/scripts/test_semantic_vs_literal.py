"""
اختبار: هل النظام يفهم المعنى أم يطابق الحروف؟
Test: Does the system understand meaning or just match letters?
"""
from utils.ai import get_embedding, cosine_similarity

print("\n" + "="*70)
print("🧪 اختبار: التشابه الدلالي (Semantic) vs تطابق الحروف (Literal)")
print("="*70)

# الجملة الأصلية
original = "We need better food options during hackathons"
original_emb = get_embedding(original)

print(f"\n📌 الجملة الأصلية:\n   '{original}'\n")

# اختبار 1: نفس المعنى، كلمات مختلفة تماماً
test_cases = [
    {
        "text": "I'm starving at tech events",
        "explanation": "نفس المعنى (جائع في الفعاليات)، كلمات مختلفة تماماً"
    },
    {
        "text": "Improve catering services at conferences",
        "explanation": "نفس المعنى (تحسين الطعام)، مصطلحات رسمية"
    },
    {
        "text": "Better internet connection at events",
        "explanation": "كلمات متشابهة لكن معنى مختلف (إنترنت ≠ طعام)"
    },
    {
        "text": "Free Azure credits for students",
        "explanation": "لا علاقة تماماً - معنى مختلف كلياً"
    },
    {
        "text": "Hungry during coding marathons",
        "explanation": "نفس المعنى (جوع في الفعاليات)، كلمات بسيطة جداً"
    }
]

print("النتائج:\n")
for i, test in enumerate(test_cases, 1):
    test_emb = get_embedding(test["text"])
    similarity = cosine_similarity(original_emb, test_emb)
    
    # تحديد الرمز حسب نسبة التشابه
    if similarity > 0.55:
        symbol = "✅ متشابه"
    elif similarity > 0.40:
        symbol = "⚠️ قريب"
    else:
        symbol = "❌ مختلف"
    
    print(f"{i}. {symbol} ({similarity*100:.1f}%)")
    print(f"   النص: '{test['text']}'")
    print(f"   التفسير: {test['explanation']}\n")

print("="*70)
print("💡 الاستنتاج:")
print("   إذا كانت النتائج 1 و 2 و 5 لها نسبة تشابه عالية،")
print("   بينما 3 و 4 لها نسبة منخفضة،")
print("   فهذا يثبت أن النظام يفهم المعنى وليس الحروف! 🧠")
print("="*70 + "\n")
