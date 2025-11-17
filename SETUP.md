# Vote.ai - Ambassador Voice Platform

## 🎉 تم إنشاء المشروع بالكامل!

تم إنشاء جميع الملفات بنجاح. إليك الخطوات التالية للبدء:

---

## 🚀 البدء السريع

### 1️⃣ إعداد قاعدة البيانات

```powershell
# الاتصال بـ Azure PostgreSQL
psql -h <your-server>.postgres.database.azure.com -U <username> -d postgres

# تشغيل السكريبت
\i backend/scripts/database_setup.sql
```

### 2️⃣ إعداد Backend (Python/FastAPI)

```powershell
# الانتقال إلى مجلد Backend
cd backend

# إنشاء بيئة افتراضية
python -m venv venv
.\venv\Scripts\Activate.ps1

# تثبيت المكتبات
pip install -r requirements.txt

# نسخ ملف الإعدادات
copy .env.example .env

# تعديل .env بإعدادات Azure الخاصة بك
# DATABASE_URL, AZURE_OPENAI_API_KEY, etc.

# تشغيل السيرفر
python main.py
```

السيرفر سيعمل على: `http://localhost:8000`
الوثائق التفاعلية: `http://localhost:8000/docs`

### 3️⃣ إعداد Frontend (React)

```powershell
# فتح نافذة PowerShell جديدة
cd frontend

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm start
```

التطبيق سيفتح على: `http://localhost:3000`

---

## 📁 هيكل المشروع المكتمل

```
Vote.ai/
├── README.md (الخطة الكاملة بالعربي)
├── SETUP.md (هذا الملف)
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

## ✅ الميزات المنفذة

### Backend (FastAPI)
- ✅ نظام مصادقة كامل (JWT)
- ✅ إنشاء واستعراض المقترحات
- ✅ نظام التصويت مع منع التكرار
- ✅ كشف التكرار بالذكاء الاصطناعي (Azure OpenAI)
- ✅ ترتيب تلقائي حسب عدد الأصوات
- ✅ حماية كاملة مع CORS

### Frontend (React)
- ✅ صفحة تسجيل الدخول/التسجيل
- ✅ عرض المقترحات مرتبة
- ✅ بطاقات مقترحات مع عداد الأصوات
- ✅ Optimistic UI للتصويت الفوري
- ✅ نافذة كشف التكرار الذكية
- ✅ واجهة عربية كاملة (RTL)

### Database (PostgreSQL)
- ✅ جداول Users, Suggestions, Votes
- ✅ Indexes للأداء العالي
- ✅ Vector extension لـ AI
- ✅ Composite keys لمنع التكرار

---

## 🧪 اختبار النظام

### 1. اختبار Backend
```powershell
# تسجيل مستخدم جديد
curl -X POST http://localhost:8000/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\",\"full_name\":\"Test User\"}'

# تسجيل الدخول
curl -X POST http://localhost:8000/auth/login `
  -F "username=test@example.com" `
  -F "password=test123"

# الحصول على المقترحات (يحتاج Token)
curl http://localhost:8000/suggestions `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. اختبار Frontend
1. افتح `http://localhost:3000`
2. سجل حساب جديد
3. أنشئ مقترحًا
4. صوّت على المقترحات
5. حاول إنشاء مقترح مشابه (سيكتشف AI التكرار)

---

## 🔧 إعدادات مهمة

### ملف `.env` في Backend
```ini
DATABASE_URL=postgresql://user:pass@server.postgres.database.azure.com:5432/postgres
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
SECRET_KEY=generate-a-random-secret-key-here
```

**لتوليد SECRET_KEY:**
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📚 الوثائق

- **README.md**: الخطة الكاملة بالعربي مع التفاصيل التقنية
- **API Docs**: `http://localhost:8000/docs` (تلقائية من FastAPI)
- **Database Schema**: `backend/scripts/database_setup.sql`

---

## 🎯 الخطوات التالية

1. ✅ قم بتعديل `.env` بإعدادات Azure الخاصة بك
2. ✅ شغّل قاعدة البيانات SQL script
3. ✅ شغّل Backend
4. ✅ شغّل Frontend
5. ✅ جرّب النظام!

---

## 💡 نصائح

- استخدم **Postman** لاختبار الـ API مباشرة
- تحقق من `http://localhost:8000/docs` للوثائق التفاعلية
- الـ Frontend يحفظ الـ Token في `localStorage`
- لحذف الـ Token: افتح Console واكتب `localStorage.clear()`

---

## 🆘 مشاكل شائعة

### Backend لا يعمل
- تأكد من تثبيت جميع المكتبات: `pip install -r requirements.txt`
- تحقق من ملف `.env` والإعدادات
- تأكد من تشغيل PostgreSQL

### Frontend لا يعمل
- شغّل `npm install` أولاً
- تأكد من Backend يعمل على port 8000
- تحقق من Console للأخطاء

### Database Errors
- تأكد من تثبيت pgvector extension
- تحقق من صلاحيات المستخدم في Azure PostgreSQL
- راجع `database_setup.sql` للتأكد من الـ tables

---

## 🎉 جاهز للعمل!

المشروع جاهز بالكامل. جميع الملفات تم إنشاؤها بنجاح! 🚀

للدعم، راجع README.md للتفاصيل الكاملة.
