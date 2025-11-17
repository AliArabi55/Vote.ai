# 🎯 خطوات تفعيل pgvector على Azure - دليل مصور

## 📌 نظرة عامة

تحتاج لتنفيذ خطوة واحدة فقط على **Azure Portal** ثم تشغيل سكريبت Python لإكمال الإعداد.

---

## 🌐 الخطوة المطلوبة على Azure Portal

### **الخطوة 1: فتح Azure PostgreSQL Server**

1. اذهب إلى: https://portal.azure.com
2. سجل الدخول
3. في شريط البحث اكتب: **`voteai`**
4. اختر: **voteai (Azure Database for PostgreSQL flexible server)**

```
🔍 البحث في Azure Portal:
┌─────────────────────────────────────┐
│ 🔍 Search resources...  [voteai]   │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 🗄️ voteai                           │
│    Azure Database for PostgreSQL    │
│    flexible server                  │
└─────────────────────────────────────┘
```

---

### **الخطوة 2: الانتقال إلى Server Parameters**

من القائمة اليسرى:

```
voteai - Azure Database for PostgreSQL
├─ Overview
├─ Activity log
├─ Access control (IAM)
├─ Tags
│
├─ 📁 Settings                    ← اضغط هنا
│   ├─ Compute + storage
│   ├─ Networking
│   ├─ High availability
│   ├─ Backup
│   ├─ Authentication
│   └─ ⚙️ Server parameters       ← ثم اضغط هنا
│
└─ Monitoring
```

---

### **الخطوة 3: البحث عن azure.extensions**

في صفحة Server Parameters:

```
Server parameters
┌──────────────────────────────────────┐
│ 🔍 Search...  [azure.extensions]    │  ← اكتب هنا
└──────────────────────────────────────┘

↓ النتائج:

┌────────────────────────────────────────────────────────┐
│ Parameter Name: azure.extensions                       │
│ Value: [Click to edit]                                │
│ Description: Specifies which extensions can be loaded │
└────────────────────────────────────────────────────────┘
```

---

### **الخطوة 4: تفعيل VECTOR Extension**

1. اضغط على صف **azure.extensions**
2. ستظهر نافذة منبثقة بقائمة Extensions
3. ابحث عن **VECTOR** في القائمة
4. ضع علامة ✅ بجانب **VECTOR**

```
Edit Parameter
┌──────────────────────────────────────┐
│ azure.extensions                     │
├──────────────────────────────────────┤
│ Select extensions:                   │
│                                      │
│ ☐ ADDRESS_STANDARDIZER               │
│ ☐ BLOOM                              │
│ ☐ BTREE_GIN                          │
│ ☐ CUBE                               │
│ ☐ HSTORE                             │
│ ☐ PG_STAT_STATEMENTS                 │
│ ☑️ VECTOR                            │ ← ضع علامة هنا
│ ☐ UUID_OSSP                          │
│                                      │
│ [Cancel]              [Save] ✅      │ ← اضغط Save
└──────────────────────────────────────┘
```

---

### **الخطوة 5: انتظار إعادة التشغيل**

بعد الضغط على **Save**:

```
⏳ Updating server parameters...

┌──────────────────────────────────────┐
│ ✅ Successfully updated              │
│                                      │
│ Server is restarting...              │
│ This may take 2-5 minutes            │
└──────────────────────────────────────┘
```

**⏱️ الانتظار**: 2-5 دقائق حتى يكتمل إعادة التشغيل.

---

### **الخطوة 6: التحقق من الحفظ**

بعد إعادة التشغيل، تحقق من أن **VECTOR** موجود في القيمة:

```
Server parameters

Parameter Name         Value
─────────────────────────────────────────
azure.extensions      VECTOR              ✅ يجب أن يظهر
```

---

## 💻 الخطوات على جهازك المحلي

بعد إكمال الخطوات على Azure Portal، افتح PowerShell:

### **الخطوة 7: تفعيل pgvector Extension**

```powershell
cd C:\Users\aliar\OneDrive\Documents\GitHub\Vote.ai\backend
.\venv\Scripts\Activate.ps1
python scripts\enable_pgvector.py
```

**النتيجة المتوقعة**:
```
============================================================
🔧 Enabling pgvector Extension on Azure PostgreSQL
============================================================

📡 Connecting to database...
   Host: voteai.postgres.database.azure.com

✅ Connected successfully!

📦 Enabling pgvector extension...
✅ pgvector extension enabled!

🔍 Verifying extension...
✅ pgvector is active!
   Extension Name: vector
   Extension Version: 0.5.0

============================================================
✅ pgvector Setup Complete!
============================================================

Next step: Run database initialization
  python scripts\init_db.py
```

---

### **الخطوة 8: إنشاء جداول قاعدة البيانات**

```powershell
python scripts\init_db.py
```

**النتيجة المتوقعة**:
```
============================================================
🔧 Initializing Vote.ai Database
============================================================

📋 Creating tables...
   - users
   - suggestions
   - votes

✅ Database tables created successfully!

============================================================
📊 Database Schema
============================================================

Table: users
  - id (UUID, Primary Key)
  - email (String, Unique, Indexed)
  - full_name (String)
  - password_hash (String)
  - role (String)
  - created_at (Timestamp)

Table: suggestions
  - id (UUID, Primary Key)
  - user_id (UUID, Foreign Key → users)
  - title (String)
  - description (Text)
  - embedding (Vector[1536]) ← pgvector for AI
  - vote_count (Integer, Indexed)
  - status (String)
  - created_at (Timestamp)

Table: votes
  - user_id (UUID, Primary Key)
  - suggestion_id (UUID, Primary Key)
  - voted_at (Timestamp)

============================================================
✅ Your database is ready to use!
============================================================
```

---

### **الخطوة 9: تشغيل الخادم**

```powershell
python main.py
```

**النتيجة المتوقعة**:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

افتح المتصفح: **http://localhost:8000/docs**

---

### **الخطوة 10: اختبار نظام المصادقة**

في نافذة PowerShell جديدة (اترك الخادم يعمل):

```powershell
cd C:\Users\aliar\OneDrive\Documents\GitHub\Vote.ai\backend
.\venv\Scripts\Activate.ps1
python scripts\test_auth.py
```

**النتيجة المتوقعة**:
```
============================================================
🧪 Vote.ai Authentication System Tests
============================================================

▶ Testing: Health Check
--------------------------------------------------
✅ Server is running!
   Response: {'status': 'healthy'}

▶ Testing: User Registration
--------------------------------------------------
✅ User registered successfully!
   User ID: 550e8400-e29b-41d4-a716-446655440000
   Email: alice@example.com
   Name: Alice Ambassador

▶ Testing: User Login
--------------------------------------------------
✅ Login successful!
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

▶ Testing: Get Current User (Protected)
--------------------------------------------------
✅ Authentication working!
   Authenticated as: alice@example.com
   Role: ambassador

▶ Testing: Invalid Token Rejection
--------------------------------------------------
✅ Invalid tokens are properly rejected!

▶ Testing: Duplicate Email Prevention
--------------------------------------------------
✅ Duplicate emails are properly rejected!

============================================================
🎉 All Tests Passed!
============================================================

✅ Health check working
✅ User registration working
✅ Login and JWT token generation working
✅ Protected route authentication working
✅ Invalid token rejection working
✅ Duplicate email prevention working

🚀 Your authentication system is fully functional!
```

---

## ✅ قائمة التحقق النهائية

- [ ] **Azure Portal**: تفعيل VECTOR في azure.extensions
- [ ] **Azure Portal**: انتظار إعادة التشغيل (2-5 دقائق)
- [ ] **PowerShell**: تشغيل `enable_pgvector.py`
- [ ] **PowerShell**: تشغيل `init_db.py`
- [ ] **PowerShell**: تشغيل `python main.py`
- [ ] **متصفح**: فتح http://localhost:8000/docs
- [ ] **PowerShell جديد**: تشغيل `test_auth.py`
- [ ] **تحقق**: كل الاختبارات نجحت ✅

---

## 🆘 المساعدة

### إذا فشل `enable_pgvector.py`:

```
❌ Database Error: permission denied to create extension "vector"
```

**الحل**: تأكد أنك أكملت الخطوة 1-6 على Azure Portal أولاً!

---

### إذا فشل `init_db.py`:

```
❌ Error: type "vector" does not exist
```

**الحل**: شغل `enable_pgvector.py` مرة أخرى.

---

### إذا فشل الاتصال بقاعدة البيانات:

```
❌ Database Error: connection to server failed
```

**الحل**: تحقق من:
1. Firewall rules تسمح بـ IP الخاص بك
2. DATABASE_URL صحيح في ملف `.env`
3. الخادم مُشغّل على Azure

---

## 📞 الخطوات التالية

بعد نجاح كل الاختبارات:

1. ✅ نظام المصادقة يعمل بكفاءة
2. ✅ قاعدة البيانات جاهزة
3. ✅ pgvector مُفعّل للذكاء الاصطناعي
4. 🚀 جاهز لتطوير باقي المميزات!

---

**📅 تاريخ الإنشاء**: 17 نوفمبر 2025  
**✏️ آخر تحديث**: 17 نوفمبر 2025  
**✅ الحالة**: جاهز للتنفيذ
