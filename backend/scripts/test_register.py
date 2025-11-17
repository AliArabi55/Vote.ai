"""
Test user registration via API
"""
import httpx
import json

print("=" * 60)
print("🧪 Testing User Registration")
print("=" * 60)
print()

# User data
user_data = {
    "email": "ali@studentambassadors.com",
    "password": "StrongPassword123!",
    "full_name": "Ali Arabi",
    "role": "manager"
}

print("📤 Sending registration request...")
print(f"   Email: {user_data['email']}")
print(f"   Name: {user_data['full_name']}")
print(f"   Role: {user_data['role']}")
print()

try:
    response = httpx.post(
        "http://localhost:8000/auth/register",
        json=user_data,
        timeout=10.0
    )
    
    if response.status_code == 201:
        user = response.json()
        print("✅ تم تسجيل المستخدم بنجاح!")
        print()
        print("📋 معلومات المستخدم:")
        print(f"   🆔 ID: {user['id']}")
        print(f"   📧 Email: {user['email']}")
        print(f"   👤 Name: {user['full_name']}")
        print(f"   🎭 Role: {user['role']}")
        print()
        print("=" * 60)
        print("✅ Test Passed!")
        print("=" * 60)
        
    elif response.status_code == 400:
        print("⚠️  المستخدم موجود بالفعل!")
        print(f"   Response: {response.json()}")
        
    else:
        print(f"❌ خطأ: {response.status_code}")
        print(f"   Response: {response.text}")
        
except httpx.ConnectError:
    print("❌ لا يمكن الاتصال بالخادم!")
    print()
    print("تأكد من أن الخادم يعمل:")
    print("   cd backend")
    print("   .\\venv\\Scripts\\python.exe main.py")
    
except Exception as e:
    print(f"❌ خطأ: {e}")
