"""
Quick test script to verify authentication system
"""
import sys
from pathlib import Path
import httpx
import json

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

BASE_URL = "http://localhost:8000"

def print_test(name: str):
    print(f"\n{Colors.BLUE}▶ Testing: {name}{Colors.END}")
    print("-" * 50)

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message: str):
    print(f"{Colors.YELLOW}ℹ  {message}{Colors.END}")

async def run_tests():
    """Run authentication tests"""
    async with httpx.AsyncClient() as client:
        print("\n" + "=" * 60)
        print("🧪 Vote.ai Authentication System Tests")
        print("=" * 60)
        
        # Test 1: Health Check
        print_test("Health Check")
        try:
            response = await client.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                print_success("Server is running!")
                print(f"   Response: {response.json()}")
            else:
                print_error(f"Server returned status {response.status_code}")
                return
        except Exception as e:
            print_error(f"Could not connect to server: {e}")
            print_info("Make sure the server is running: python main.py")
            return
        
        # Test 2: Register User
        print_test("User Registration")
        register_data = {
            "email": "alice@example.com",
            "password": "SecurePass123!",
            "full_name": "Alice Ambassador",
            "role": "ambassador"
        }
        
        try:
            response = await client.post(
                f"{BASE_URL}/auth/register",
                json=register_data
            )
            
            if response.status_code == 201:
                user = response.json()
                print_success("User registered successfully!")
                print(f"   User ID: {user['id']}")
                print(f"   Email: {user['email']}")
                print(f"   Name: {user['full_name']}")
            elif response.status_code == 400:
                print_info("User already exists (this is okay)")
            else:
                print_error(f"Registration failed: {response.text}")
                return
        except Exception as e:
            print_error(f"Registration error: {e}")
            return
        
        # Test 3: Login
        print_test("User Login")
        login_data = {
            "username": register_data["email"],  # OAuth2 uses 'username'
            "password": register_data["password"]
        }
        
        try:
            response = await client.post(
                f"{BASE_URL}/auth/login",
                data=login_data  # Note: form data, not JSON
            )
            
            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data["access_token"]
                print_success("Login successful!")
                print(f"   Token: {access_token[:50]}...")
            else:
                print_error(f"Login failed: {response.text}")
                return
        except Exception as e:
            print_error(f"Login error: {e}")
            return
        
        # Test 4: Get Current User (Protected Route)
        print_test("Get Current User (Protected)")
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = await client.get(
                f"{BASE_URL}/auth/me",
                headers=headers
            )
            
            if response.status_code == 200:
                user = response.json()
                print_success("Authentication working!")
                print(f"   Authenticated as: {user['email']}")
                print(f"   Role: {user['role']}")
            else:
                print_error(f"Authentication failed: {response.text}")
                return
        except Exception as e:
            print_error(f"Auth check error: {e}")
            return
        
        # Test 5: Invalid Token
        print_test("Invalid Token Rejection")
        try:
            headers = {"Authorization": "Bearer invalid-token-123"}
            response = await client.get(
                f"{BASE_URL}/auth/me",
                headers=headers
            )
            
            if response.status_code == 401:
                print_success("Invalid tokens are properly rejected!")
            else:
                print_error(f"Security issue: Invalid token was accepted!")
                return
        except Exception as e:
            print_error(f"Token validation error: {e}")
            return
        
        # Test 6: Duplicate Email
        print_test("Duplicate Email Prevention")
        try:
            response = await client.post(
                f"{BASE_URL}/auth/register",
                json=register_data
            )
            
            if response.status_code == 400:
                print_success("Duplicate emails are properly rejected!")
            else:
                print_error("Duplicate email was accepted (security issue!)")
                return
        except Exception as e:
            print_error(f"Duplicate check error: {e}")
            return
        
        # All tests passed!
        print("\n" + "=" * 60)
        print(f"{Colors.GREEN}🎉 All Tests Passed!{Colors.END}")
        print("=" * 60)
        print()
        print("✅ Health check working")
        print("✅ User registration working")
        print("✅ Login and JWT token generation working")
        print("✅ Protected route authentication working")
        print("✅ Invalid token rejection working")
        print("✅ Duplicate email prevention working")
        print()
        print("🚀 Your authentication system is fully functional!")
        print()

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_tests())
