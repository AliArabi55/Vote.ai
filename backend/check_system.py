#!/usr/bin/env python3
"""
🔍 Vote.ai - System Health Check Script
========================================
Production Readiness Verification Tool

This script performs comprehensive health checks on:
1. Backend API Server (FastAPI)
2. Database Connection (PostgreSQL)
3. AI Service (Azure OpenAI / Similarity Detection)
4. Authentication System (JWT)

Usage:
    python check_system.py

Color Codes:
    🟢 GREEN  = All systems operational
    🟡 YELLOW = Warning, partial functionality
    🔴 RED    = Critical failure
"""

import sys
import time
import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_BASE_URL = "http://localhost:8000"
DB_URL = os.getenv("DATABASE_URL", "postgresql://ali:mypassword123@localhost:5432/voteai")

# ANSI Color Codes
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

class HealthChecker:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        
    def print_header(self):
        """Print fancy header"""
        print(f"\n{CYAN}{'='*60}{RESET}")
        print(f"{BOLD}{BLUE}🔍 Vote.ai - System Health Check{RESET}")
        print(f"{CYAN}{'='*60}{RESET}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{CYAN}{'='*60}{RESET}\n")
    
    def log_test(self, name, status, message="", duration=None):
        """Log test result"""
        if status == "PASS":
            icon = "🟢"
            color = GREEN
            self.passed += 1
        elif status == "WARN":
            icon = "🟡"
            color = YELLOW
            self.warnings += 1
        else:
            icon = "🔴"
            color = RED
            self.failed += 1
        
        duration_str = f"({duration:.2f}s)" if duration else ""
        print(f"{icon} {color}{status:6}{RESET} | {name:40} {duration_str}")
        if message:
            print(f"         └─ {message}")
        
        self.results.append({
            'name': name,
            'status': status,
            'message': message
        })
    
    def check_backend_running(self):
        """Test 1: Check if Backend API is running"""
        print(f"\n{BOLD}[1] Backend API Health{RESET}")
        print("-" * 60)
        
        try:
            start = time.time()
            response = requests.get(f"{API_BASE_URL}/", timeout=5)
            duration = time.time() - start
            
            if response.status_code == 200:
                self.log_test(
                    "Backend Server Responding",
                    "PASS",
                    f"Status: {response.status_code} | Response time: {duration*1000:.0f}ms",
                    duration
                )
                return True
            else:
                self.log_test(
                    "Backend Server Responding",
                    "WARN",
                    f"Unexpected status code: {response.status_code}"
                )
                return False
        except requests.exceptions.ConnectionError:
            self.log_test(
                "Backend Server Responding",
                "FAIL",
                "❌ Cannot connect to http://localhost:8000"
            )
            print(f"\n{RED}💡 Solution: Start the backend server with:{RESET}")
            print(f"   cd backend && uvicorn main:app --reload\n")
            return False
        except Exception as e:
            self.log_test(
                "Backend Server Responding",
                "FAIL",
                f"Error: {str(e)}"
            )
            return False
    
    def check_database_connection(self):
        """Test 2: Check Database Connection"""
        print(f"\n{BOLD}[2] Database Connection{RESET}")
        print("-" * 60)
        
        try:
            start = time.time()
            engine = create_engine(DB_URL)
            
            with engine.connect() as conn:
                # Test query
                result = conn.execute(text("SELECT version();"))
                version = result.fetchone()[0]
                duration = time.time() - start
                
                self.log_test(
                    "PostgreSQL Connection",
                    "PASS",
                    f"Connected successfully | {version[:50]}...",
                    duration
                )
                
                # Check if tables exist
                tables_query = text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                result = conn.execute(tables_query)
                tables = [row[0] for row in result]
                
                expected_tables = ['users', 'suggestions']
                missing = [t for t in expected_tables if t not in tables]
                
                if not missing:
                    self.log_test(
                        "Database Schema",
                        "PASS",
                        f"All required tables exist: {', '.join(expected_tables)}"
                    )
                else:
                    self.log_test(
                        "Database Schema",
                        "WARN",
                        f"Missing tables: {', '.join(missing)}"
                    )
                
                # Count records
                users_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
                suggestions_count = conn.execute(text("SELECT COUNT(*) FROM suggestions")).scalar()
                
                self.log_test(
                    "Database Records",
                    "PASS",
                    f"Users: {users_count} | Suggestions: {suggestions_count}"
                )
                
                return True
                
        except OperationalError as e:
            self.log_test(
                "PostgreSQL Connection",
                "FAIL",
                f"Database connection failed: {str(e)}"
            )
            print(f"\n{RED}💡 Solution: Ensure PostgreSQL is running and credentials are correct{RESET}")
            print(f"   DATABASE_URL={DB_URL}\n")
            return False
        except Exception as e:
            self.log_test(
                "Database Connection",
                "FAIL",
                f"Unexpected error: {str(e)}"
            )
            return False
    
    def check_authentication(self):
        """Test 3: Check Authentication System"""
        print(f"\n{BOLD}[3] Authentication System{RESET}")
        print("-" * 60)
        
        # Test login endpoint
        try:
            login_data = {
                "username": "ali@microsoft.com",
                "password": "mypassword123"
            }
            
            start = time.time()
            response = requests.post(
                f"{API_BASE_URL}/token",
                data=login_data,
                timeout=10
            )
            duration = time.time() - start
            
            if response.status_code == 200:
                token_data = response.json()
                if "access_token" in token_data:
                    self.log_test(
                        "JWT Token Generation",
                        "PASS",
                        f"Token generated successfully | Type: {token_data.get('token_type', 'bearer')}",
                        duration
                    )
                    
                    # Test protected endpoint with token
                    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
                    me_response = requests.get(
                        f"{API_BASE_URL}/users/me",
                        headers=headers,
                        timeout=5
                    )
                    
                    if me_response.status_code == 200:
                        user_data = me_response.json()
                        self.log_test(
                            "Protected Endpoint Access",
                            "PASS",
                            f"User authenticated: {user_data.get('email', 'Unknown')}"
                        )
                    else:
                        self.log_test(
                            "Protected Endpoint Access",
                            "WARN",
                            f"Status: {me_response.status_code}"
                        )
                    
                    return True
                else:
                    self.log_test(
                        "JWT Token Generation",
                        "FAIL",
                        "access_token not in response"
                    )
                    return False
            else:
                self.log_test(
                    "JWT Token Generation",
                    "WARN",
                    f"Login failed - Status: {response.status_code}"
                )
                print(f"\n{YELLOW}💡 Note: Create test user with email: ali@microsoft.com{RESET}\n")
                return False
                
        except Exception as e:
            self.log_test(
                "Authentication System",
                "FAIL",
                f"Error: {str(e)}"
            )
            return False
    
    def check_ai_service(self):
        """Test 4: Check AI Similarity Detection"""
        print(f"\n{BOLD}[4] AI Service (Azure OpenAI){RESET}")
        print("-" * 60)
        
        try:
            # First, get a valid token
            login_data = {
                "username": "ali@microsoft.com",
                "password": "mypassword123"
            }
            
            login_response = requests.post(
                f"{API_BASE_URL}/token",
                data=login_data,
                timeout=10
            )
            
            if login_response.status_code != 200:
                self.log_test(
                    "AI Service Authentication",
                    "FAIL",
                    "Cannot get auth token for AI testing"
                )
                return False
            
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test AI similarity endpoint
            test_payload = {
                "suggestion_text": "We need better Wi-Fi in the library"
            }
            
            start = time.time()
            response = requests.post(
                f"{API_BASE_URL}/suggestions/check-similarity",
                json=test_payload,
                headers=headers,
                timeout=30  # AI calls can take longer
            )
            duration = time.time() - start
            
            if response.status_code == 200:
                result = response.json()
                
                self.log_test(
                    "AI Endpoint Responding",
                    "PASS",
                    f"Similarity check completed in {duration:.2f}s",
                    duration
                )
                
                if "similar_suggestions" in result:
                    similar_count = len(result["similar_suggestions"])
                    self.log_test(
                        "AI Similarity Detection",
                        "PASS",
                        f"Found {similar_count} similar suggestion(s)"
                    )
                    
                    # Check if similarity scores are present
                    if similar_count > 0:
                        first_score = result["similar_suggestions"][0].get("similarity_score", 0)
                        self.log_test(
                            "AI Scoring System",
                            "PASS",
                            f"Similarity scores calculated (e.g., {first_score:.3f})"
                        )
                    
                    return True
                else:
                    self.log_test(
                        "AI Response Format",
                        "WARN",
                        "Expected 'similar_suggestions' key in response"
                    )
                    return False
            else:
                error_detail = "Unknown error"
                try:
                    error_detail = response.json().get("detail", str(response.text))
                except:
                    error_detail = response.text[:100]
                
                self.log_test(
                    "AI Endpoint Responding",
                    "FAIL",
                    f"Status {response.status_code}: {error_detail}"
                )
                
                if "AZURE_OPENAI" in str(error_detail):
                    print(f"\n{RED}💡 Solution: Check Azure OpenAI credentials in .env file{RESET}\n")
                
                return False
                
        except requests.exceptions.Timeout:
            self.log_test(
                "AI Service",
                "FAIL",
                "Request timeout (>30s) - Azure OpenAI may be slow or unavailable"
            )
            return False
        except Exception as e:
            self.log_test(
                "AI Service",
                "FAIL",
                f"Error: {str(e)}"
            )
            return False
    
    def check_api_endpoints(self):
        """Test 5: Check Critical API Endpoints"""
        print(f"\n{BOLD}[5] API Endpoints{RESET}")
        print("-" * 60)
        
        # Get auth token first
        try:
            login_data = {
                "username": "ali@microsoft.com",
                "password": "mypassword123"
            }
            login_response = requests.post(f"{API_BASE_URL}/token", data=login_data, timeout=10)
            
            if login_response.status_code != 200:
                self.log_test("API Endpoints", "FAIL", "Cannot authenticate for endpoint testing")
                return False
            
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test GET /suggestions
            response = requests.get(f"{API_BASE_URL}/suggestions/", headers=headers, timeout=10)
            if response.status_code == 200:
                suggestions = response.json()
                self.log_test(
                    "GET /suggestions/",
                    "PASS",
                    f"Retrieved {len(suggestions)} suggestions"
                )
            else:
                self.log_test("GET /suggestions/", "WARN", f"Status: {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_test("API Endpoints", "FAIL", f"Error: {str(e)}")
            return False
    
    def print_summary(self):
        """Print final summary"""
        print(f"\n{CYAN}{'='*60}{RESET}")
        print(f"{BOLD}📊 Test Summary{RESET}")
        print(f"{CYAN}{'='*60}{RESET}")
        
        total = self.passed + self.warnings + self.failed
        pass_rate = (self.passed / total * 100) if total > 0 else 0
        
        print(f"Total Tests:     {total}")
        print(f"{GREEN}Passed:          {self.passed} ✓{RESET}")
        print(f"{YELLOW}Warnings:        {self.warnings} ⚠{RESET}")
        print(f"{RED}Failed:          {self.failed} ✗{RESET}")
        print(f"\nPass Rate:       {pass_rate:.1f}%")
        
        print(f"\n{CYAN}{'='*60}{RESET}")
        
        # Final verdict
        if self.failed == 0 and self.warnings == 0:
            print(f"\n{GREEN}{BOLD}🟢 SYSTEM STATUS: ALL GREEN ✨{RESET}")
            print(f"{GREEN}All systems operational. Ready for production! 🚀{RESET}\n")
            return True
        elif self.failed == 0:
            print(f"\n{YELLOW}{BOLD}🟡 SYSTEM STATUS: GREEN WITH WARNINGS{RESET}")
            print(f"{YELLOW}System is functional but has minor issues.{RESET}\n")
            return True
        else:
            print(f"\n{RED}{BOLD}🔴 SYSTEM STATUS: CRITICAL FAILURES{RESET}")
            print(f"{RED}System has critical issues that need to be resolved.{RESET}\n")
            return False

def main():
    checker = HealthChecker()
    checker.print_header()
    
    # Run all health checks
    checker.check_backend_running()
    checker.check_database_connection()
    checker.check_authentication()
    checker.check_ai_service()
    checker.check_api_endpoints()
    
    # Print summary
    is_healthy = checker.print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if is_healthy else 1)

if __name__ == "__main__":
    main()
