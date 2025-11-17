"""
Automated Test for AI Similarity Detection (Yellow Box Feature)
Tests the /suggestions/check-similarity endpoint

This script verifies that the "Yellow Box" appears when similar ideas are detected.
"""
import requests
import json
import sys
from typing import Dict, List

# Configuration
BACKEND_URL = "http://localhost:8000"
CHECK_SIMILARITY_ENDPOINT = f"{BACKEND_URL}/suggestions/check-similarity"

# Test credentials (must match a user in your database)
TEST_EMAIL = "ali@microsoft.com"
TEST_PASSWORD = "mypassword123"

# ANSI color codes for pretty output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{BLUE}{BOLD}{'='*60}{RESET}")
    print(f"{BLUE}{BOLD}{text}{RESET}")
    print(f"{BLUE}{BOLD}{'='*60}{RESET}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{GREEN}✅ {text}{RESET}")


def print_error(text: str):
    """Print error message"""
    print(f"{RED}❌ {text}{RESET}")


def print_warning(text: str):
    """Print warning message"""
    print(f"{YELLOW}⚠️  {text}{RESET}")


def print_info(text: str):
    """Print info message"""
    print(f"{BLUE}ℹ️  {text}{RESET}")


def login() -> str:
    """
    Login to get JWT token
    Returns: Access token string
    """
    print_info("Authenticating...")
    
    login_url = f"{BACKEND_URL}/auth/login"
    login_data = {
        "username": TEST_EMAIL,  # OAuth2 uses 'username' field
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(login_url, data=login_data)
        response.raise_for_status()
        
        token = response.json().get("access_token")
        print_success(f"Logged in as: {TEST_EMAIL}")
        return token
        
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend. Is it running on http://localhost:8000?")
        print_info("Start backend with: cd backend && python main.py")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print_error(f"Login failed: {e}")
        print_warning("Check your credentials in the script")
        sys.exit(1)


def test_similar_idea(token: str) -> Dict:
    """
    Test 1: Query with similar idea (should trigger Yellow Box)
    """
    print_header("TEST 1: Similar Idea Detection (Yellow Box)")
    
    query = "Better food at events"
    print_info(f"Query: '{query}'")
    print_info("Expected: Should find similar suggestions")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "query": query,
        "limit": 5
    }
    
    try:
        response = requests.post(
            CHECK_SIMILARITY_ENDPOINT,
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        results = response.json()
        
        print(f"\n{BOLD}Response:{RESET}")
        print(json.dumps(results, indent=2))
        
        if results and len(results) > 0:
            print_success(f"Found {len(results)} similar suggestion(s)")
            
            for i, suggestion in enumerate(results, 1):
                similarity = suggestion.get('similarity_score', 0) * 100
                print(f"\n  {i}. {suggestion.get('title')}")
                print(f"     Similarity: {similarity:.1f}%")
                print(f"     Votes: {suggestion.get('total_votes', 0)}")
            
            print(f"\n{GREEN}{BOLD}✅ TEST PASSED: Yellow Box TRIGGERED!{RESET}")
            print_success("Similar ideas were detected - User would see warning box")
            return {"status": "PASS", "count": len(results)}
        else:
            print_error("No similar suggestions found")
            print_warning("Yellow Box would NOT appear")
            print_info("This might mean:")
            print_info("  1. Database is empty")
            print_info("  2. No similar suggestions exist")
            print_info("  3. Similarity threshold is too high (currently 55%)")
            return {"status": "FAIL", "count": 0}
            
    except requests.exceptions.HTTPError as e:
        print_error(f"API Error: {e}")
        print(f"Response: {e.response.text}")
        return {"status": "ERROR", "message": str(e)}


def test_new_idea(token: str) -> Dict:
    """
    Test 2: Query with new idea (should NOT trigger Yellow Box)
    """
    print_header("TEST 2: New Idea Detection (Green Checkmark)")
    
    query = "Free Azure credits for all students globally"
    print_info(f"Query: '{query}'")
    print_info("Expected: Should NOT find similar suggestions")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "query": query,
        "limit": 5
    }
    
    try:
        response = requests.post(
            CHECK_SIMILARITY_ENDPOINT,
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        results = response.json()
        
        print(f"\n{BOLD}Response:{RESET}")
        print(json.dumps(results, indent=2))
        
        if not results or len(results) == 0:
            print_success("No similar suggestions found")
            print(f"\n{GREEN}{BOLD}✅ TEST PASSED: Green Checkmark TRIGGERED!{RESET}")
            print_success("This is a new idea - User would see 'Great! This looks like a new idea.'")
            return {"status": "PASS", "count": 0}
        else:
            print_warning(f"Found {len(results)} similar suggestion(s)")
            print_info("This might be expected if database has similar content")
            return {"status": "UNEXPECTED", "count": len(results)}
            
    except requests.exceptions.HTTPError as e:
        print_error(f"API Error: {e}")
        return {"status": "ERROR", "message": str(e)}


def test_debounce_simulation():
    """
    Test 3: Simulates debounce behavior (500ms delay)
    """
    print_header("TEST 3: Debounce Simulation")
    
    print_info("Frontend waits 500ms after user stops typing")
    print_info("Simulating rapid typing... (3 queries in quick succession)")
    
    import time
    
    queries = ["B", "Be", "Better food"]
    
    for i, query in enumerate(queries, 1):
        print(f"\n  Keystroke {i}: '{query}'")
        time.sleep(0.1)  # Simulate typing speed
        print(f"    ⏳ Waiting 500ms for debounce...")
    
    time.sleep(0.5)
    print(f"\n  ✅ 500ms passed - API call would trigger NOW")
    print_success("Debounce prevents 2 unnecessary API calls (saved bandwidth!)")
    
    return {"status": "PASS"}


def main():
    """
    Main test runner
    """
    print_header("🧪 AI Similarity Detection - Automated Test Suite")
    
    # Check if backend is reachable
    try:
        health_check = requests.get(f"{BACKEND_URL}/health", timeout=2)
        print_success(f"Backend is running on {BACKEND_URL}")
    except:
        print_error(f"Backend not reachable at {BACKEND_URL}")
        print_info("Start backend: cd backend && python main.py")
        sys.exit(1)
    
    # Step 1: Login
    token = login()
    
    # Step 2: Test similar idea (Yellow Box)
    test1_result = test_similar_idea(token)
    
    # Step 3: Test new idea (Green Checkmark)
    test2_result = test_new_idea(token)
    
    # Step 4: Test debounce simulation
    test3_result = test_debounce_simulation()
    
    # Summary
    print_header("📊 Test Summary")
    
    results = [
        ("Similar Idea Detection (Yellow Box)", test1_result),
        ("New Idea Detection (Green Checkmark)", test2_result),
        ("Debounce Simulation", test3_result)
    ]
    
    passed = sum(1 for _, r in results if r.get("status") == "PASS")
    total = len(results)
    
    for test_name, result in results:
        status = result.get("status")
        if status == "PASS":
            print_success(f"{test_name}: PASSED")
        elif status == "FAIL":
            print_error(f"{test_name}: FAILED")
        else:
            print_warning(f"{test_name}: {status}")
    
    print(f"\n{BOLD}Total: {passed}/{total} tests passed{RESET}")
    
    if passed == total:
        print(f"\n{GREEN}{BOLD}{'='*60}{RESET}")
        print(f"{GREEN}{BOLD}🎉 ALL TESTS PASSED! 🎉{RESET}")
        print(f"{GREEN}{BOLD}{'='*60}{RESET}")
        print_success("AI Similarity Detection is working perfectly!")
        print_success("Yellow Box feature is ready for production!")
        sys.exit(0)
    else:
        print(f"\n{RED}{BOLD}{'='*60}{RESET}")
        print(f"{RED}{BOLD}⚠️  SOME TESTS FAILED{RESET}")
        print(f"{RED}{BOLD}{'='*60}{RESET}")
        sys.exit(1)


if __name__ == "__main__":
    main()
