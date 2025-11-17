# 🚀 Step 4: Authentication System - Implementation Guide

## ✅ All Code Files Are Ready!

Great news! All the authentication code has already been created in your project. Here's what you have:

---

## 📁 File Structure Overview

```
backend/
├── core/
│   ├── __init__.py
│   └── config.py                    ✅ Configuration management
│
├── database/
│   ├── __init__.py
│   ├── connection.py                ✅ Database connection
│   └── models.py                    ✅ User, Suggestion, Vote models
│
├── utils/
│   ├── __init__.py
│   └── security.py                  ✅ Password hashing & JWT
│
├── routers/
│   ├── __init__.py
│   ├── auth.py                      ✅ Register, Login, Get User
│   └── suggestions.py               ✅ (Already exists)
│
├── scripts/
│   └── database_setup.sql           ✅ Database initialization
│
├── main.py                          ✅ FastAPI application
├── requirements.txt                 ✅ Python dependencies
└── .env                             ✅ Configuration (with your keys)
```

---

## 📋 What Each File Does

### **1. `core/config.py`**
**Purpose**: Manages all configuration from environment variables

**Key Features**:
- Loads DATABASE_URL, Azure OpenAI keys, SECRET_KEY from `.env`
- Uses Pydantic Settings for type safety
- Single source of truth for all configs

### **2. `database/connection.py`**
**Purpose**: Handles PostgreSQL connection

**Key Features**:
- Creates SQLAlchemy engine with connection pooling
- Provides `get_db()` dependency for FastAPI routes
- Connection pool: 10 base + 20 overflow connections

### **3. `database/models.py`**
**Purpose**: Defines database schemas

**Tables**:
- ✅ **User**: id, email, password_hash, full_name, role, created_at
- ✅ **Suggestion**: id, user_id, title, description, embedding (pgvector), vote_count, status, created_at
- ✅ **Vote**: user_id + suggestion_id (composite primary key), voted_at

**Special Features**:
- UUID primary keys for better distribution
- `embedding` column uses pgvector for AI similarity search
- Indexed on `vote_count` for fast ranking

### **4. `utils/security.py`**
**Purpose**: Security functions for authentication

**Functions**:
- ✅ `hash_password()`: Bcrypt password hashing
- ✅ `verify_password()`: Verify plain password against hash
- ✅ `create_access_token()`: Generate JWT tokens (30min expiry)
- ✅ `verify_token()`: Validate and decode JWT

### **5. `routers/auth.py`**
**Purpose**: Authentication endpoints

**Endpoints**:
- ✅ `POST /auth/register`: Create new user account
  - Validates email uniqueness
  - Hashes password with bcrypt
  - Returns user data (no password)
  
- ✅ `POST /auth/login`: Authenticate user
  - Accepts email + password
  - Returns JWT access token
  - Token contains: email, user_id, role
  
- ✅ `GET /auth/me`: Get current user info
  - Requires JWT token
  - Returns authenticated user data

**Security**:
- Uses OAuth2PasswordBearer for token extraction
- `get_current_user()` dependency protects routes

### **6. `main.py`**
**Purpose**: FastAPI application entry point

**Features**:
- ✅ CORS enabled for React frontend
- ✅ Includes auth and suggestions routers
- ✅ Health check endpoints (`/`, `/health`)
- ✅ Auto-reload in development mode

---

## 🔧 Installation & Setup Steps

### **Step 6.1: Install Python Dependencies**

Open PowerShell in your project root and run:

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install all dependencies
pip install -r requirements.txt
```

**Expected output**:
```
Successfully installed fastapi-0.109.0 uvicorn-0.27.0 sqlalchemy-2.0.25 ...
```

---

### **Step 6.2: Initialize Database Tables**

The database tables need to be created. You have two options:

#### **Option A: Using SQLAlchemy (Recommended)**

Create a Python script to initialize tables:

```powershell
# Still in backend directory with venv activated
python -c "
from database.connection import Base, engine
from database.models import User, Suggestion, Vote

print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('✅ Tables created successfully!')
"
```

#### **Option B: Using SQL Script**

```powershell
# Run the SQL setup script
psql "postgresql://voteadmin:YOUR_PASSWORD@voteai.postgres.database.azure.com:5432/postgres?sslmode=require" -f scripts/database_setup.sql
```

---

### **Step 6.3: Start the Backend Server**

```powershell
# Make sure you're in backend/ with venv activated
python main.py
```

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Your API is now running at**: http://localhost:8000

---

## 🧪 Testing the Authentication System

### **Test 1: Check API is Running**

Open your browser and go to:
```
http://localhost:8000
```

You should see:
```json
{
  "message": "Welcome to Ambassador Voice Platform API",
  "status": "running",
  "version": "1.0.0"
}
```

---

### **Test 2: Interactive API Documentation**

FastAPI provides automatic interactive docs!

Go to:
```
http://localhost:8000/docs
```

You'll see a beautiful Swagger UI with all your endpoints:
- 📁 Authentication
  - POST `/auth/register`
  - POST `/auth/login`
  - GET `/auth/me`
- 📁 Suggestions (if available)

---

### **Test 3: Register a New User**

#### Using the API Docs (Easy):

1. Go to http://localhost:8000/docs
2. Click on **POST `/auth/register`**
3. Click **"Try it out"**
4. Enter this JSON:
```json
{
  "email": "test@example.com",
  "password": "Test123456!",
  "full_name": "Test User",
  "role": "ambassador"
}
```
5. Click **"Execute"**

**Expected Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "full_name": "Test User",
  "role": "ambassador"
}
```

#### Using PowerShell:

```powershell
$body = @{
    email = "test@example.com"
    password = "Test123456!"
    full_name = "Test User"
    role = "ambassador"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/auth/register" `
                  -Method Post `
                  -ContentType "application/json" `
                  -Body $body
```

---

### **Test 4: Login**

#### Using API Docs:

1. Go to **POST `/auth/login`**
2. Click **"Try it out"**
3. Enter:
   - **username**: `test@example.com` (Yes, use email here!)
   - **password**: `Test123456!`
4. Click **"Execute"**

**Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Copy the `access_token`** - you'll need it for the next test!

---

### **Test 5: Get Current User (Protected Route)**

This tests JWT authentication:

#### Using API Docs:

1. At the top right of http://localhost:8000/docs, click **"Authorize"** 🔓
2. Paste your access_token
3. Click **"Authorize"**
4. Now go to **GET `/auth/me`**
5. Click **"Try it out"** → **"Execute"**

**Expected Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "full_name": "Test User",
  "role": "ambassador"
}
```

✅ **If you see this, authentication is working perfectly!**

---

## 🔍 Verification Checklist

After running all tests, verify:

- [ ] ✅ Backend server starts without errors
- [ ] ✅ API docs accessible at `/docs`
- [ ] ✅ User registration works (201 Created)
- [ ] ✅ Duplicate email rejected (400 Bad Request)
- [ ] ✅ Login returns JWT token
- [ ] ✅ Invalid credentials rejected (401 Unauthorized)
- [ ] ✅ Protected route `/auth/me` requires token
- [ ] ✅ Token authentication works

---

## 🐛 Troubleshooting

### **Issue: "No module named 'pydantic_settings'"**
```powershell
pip install pydantic-settings
```

### **Issue: "Could not connect to database"**
- Check your DATABASE_URL in `.env`
- Verify PostgreSQL server is running in Azure
- Check firewall rules allow your IP

### **Issue: "SECRET_KEY not found"**
- Verify `.env` file exists in `backend/` directory
- Check SECRET_KEY is present and not empty

### **Issue: ImportError for 'pgvector'**
```powershell
pip install pgvector
```

---

## 🎉 Success!

If all tests pass, **your authentication system is fully working!**

**What you've accomplished**:
✅ Secure password hashing with bcrypt  
✅ JWT token generation and validation  
✅ User registration with email uniqueness check  
✅ Login with credentials validation  
✅ Protected routes requiring authentication  
✅ Database models with proper relationships  
✅ Connection to Azure PostgreSQL  

---

## 🚀 Next Steps

Now that authentication works, you can:

1. **Test Suggestion Creation** (uses authentication)
2. **Test Voting System**
3. **Test AI Duplicate Detection**
4. **Connect React Frontend**

---

**Ready to proceed?** Let me know if all tests pass! 🎯
