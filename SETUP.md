# Vote.ai - Ambassador Voice Platform

## 🎉 Project Successfully Created!

All files have been successfully created. Here are the next steps to get started:

---

## 🚀 Quick Start

### 1️⃣ Database Setup

```powershell
# Connect to Azure PostgreSQL
psql -h <your-server>.postgres.database.azure.com -U <username> -d postgres

# Run the setup script
\i backend/scripts/database_setup.sql
```

### 2️⃣ Backend Setup (Python/FastAPI)

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install libraries
pip install -r requirements.txt

# Copy settings file
copy .env.example .env

# Edit .env with your Azure settings
# DATABASE_URL, AZURE_OPENAI_API_KEY, etc.

# Run the server
python main.py
```

Server will run on: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### 3️⃣ Frontend Setup (React)

```powershell
# Open a new PowerShell window
cd frontend

# Install libraries
npm install

# Run the application
npm start
```

Application will open on: `http://localhost:3000`

---

## 📁 Complete Project Structure

```
Vote.ai/
├── README.md (Complete plan in English)
├── SETUP.md (This file)
│
├── backend/
│   ├── main.py ✅
│   ├── requirements.txt ✅
│   ├── .env.example ✅
│   │
│   ├── core/
│   │   └── config.py ✅
│   │
│   ├── database/
│   │   ├── connection.py ✅
│   │   └── models.py ✅
│   │
│   ├── routers/
│   │   ├── auth.py ✅
│   │   └── suggestions.py ✅
│   │
│   ├── utils/
│   │   ├── security.py ✅
│   │   └── ai.py ✅
│   │
│   └── scripts/
│       └── database_setup.sql ✅
│
└── frontend/
    ├── package.json ✅
    ├── .env ✅
    │
    ├── public/
    │   └── index.html ✅
    │
    └── src/
        ├── index.js ✅
        ├── App.js ✅
        ├── App.css ✅
        │
        ├── pages/
        │   ├── Home.jsx ✅
        │   ├── Home.css ✅
        │   ├── Login.jsx ✅
        │   └── Login.css ✅
        │
        ├── components/
        │   ├── SuggestionCard.jsx ✅
        │   ├── SuggestionCard.css ✅
        │   ├── DuplicateDialog.jsx ✅
        │   └── DuplicateDialog.css ✅
        │
        ├── services/
        │   └── api.js ✅
        │
        └── hooks/
            └── useOptimisticVote.js ✅
```

---

## ✅ Implemented Features

### Backend (FastAPI)
- ✅ Complete authentication system (JWT)
- ✅ Create and view suggestions
- ✅ Voting system with duplicate prevention
- ✅ AI-powered duplicate detection (Azure OpenAI)
- ✅ Automatic ranking by vote count
- ✅ Full protection with CORS

### Frontend (React)
- ✅ Login/Registration page
- ✅ Display ranked suggestions
- ✅ Suggestion cards with vote counter
- ✅ Optimistic UI for instant voting
- ✅ Smart duplicate detection dialog
- ✅ Full English interface

### Database (PostgreSQL)
- ✅ Users, Suggestions, Votes tables
- ✅ Indexes for high performance
- ✅ Vector extension for AI
- ✅ Composite keys to prevent duplicates

---

## 🧪 Testing the System

### 1. Test Backend
```powershell
# Register new user
curl -X POST http://localhost:8000/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\",\"full_name\":\"Test User\"}'

# Login
curl -X POST http://localhost:8000/auth/login `
  -F "username=test@example.com" `
  -F "password=test123"

# Get suggestions (requires Token)
curl http://localhost:8000/suggestions `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Test Frontend
1. Open `http://localhost:3000`
2. Register a new account
3. Create a suggestion
4. Vote on suggestions
5. Try creating a similar suggestion (AI will detect the duplicate)

---

## 🔧 Important Settings

### `.env` file in Backend
```ini
DATABASE_URL=postgresql://user:pass@server.postgres.database.azure.com:5432/postgres
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
SECRET_KEY=generate-a-random-secret-key-here
```

**To generate SECRET_KEY:**
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📚 Documentation

- **README.md**: Complete plan in English with technical details
- **API Docs**: `http://localhost:8000/docs` (automatic from FastAPI)
- **Database Schema**: `backend/scripts/database_setup.sql`

---

## 🎯 Next Steps

1. ✅ Edit `.env` with your Azure settings
2. ✅ Run database SQL script
3. ✅ Run Backend
4. ✅ Run Frontend
5. ✅ Try the system!

---

## 💡 Tips

- Use **Postman** to test the API directly
- Check `http://localhost:8000/docs` for interactive documentation
- Frontend saves Token in `localStorage`
- To clear Token: Open Console and type `localStorage.clear()`

---

## 🆘 Common Issues

### Backend not working
- Ensure all libraries are installed: `pip install -r requirements.txt`
- Check `.env` file and settings
- Ensure PostgreSQL is running

### Frontend not working
- Run `npm install` first
- Ensure Backend is running on port 8000
- Check Console for errors

### Database Errors
- Ensure pgvector extension is installed
- Check user permissions in Azure PostgreSQL
- Review `database_setup.sql` to ensure tables are created

---

## 🎉 Ready to Work!

The project is fully ready. All files have been successfully created! 🚀

For support, review README.md for complete details.
