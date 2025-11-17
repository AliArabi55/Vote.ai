# Vote.ai - Ambassador Voice Platform
## نظام التصويت والتصنيف الديناميكي للمقترحات

---

## 📋 نظرة عامة على المشروع

**Vote.ai** هو منصة ذكية لإدارة مقترحات السفراء مع نظام تصويت ديناميكي وتصنيف تلقائي. المنصة تستخدم الذكاء الاصطناعي لدمج المقترحات المتشابهة ومنع التكرار، مما يساعد صناع القرار على رؤية الأولويات الحقيقية للمجتمع.

### 🎯 الميزات الرئيسية
- ✅ نظام تصويت ديناميكي مع تحديث فوري للواجهة (Optimistic UI)
- ✅ تصنيف تلقائي من الأعلى للأسفل حسب عدد الأصوات
- ✅ كشف ذكي للمقترحات المتشابهة باستخدام Azure OpenAI
- ✅ منع التصويت المكرر لنفس المستخدم
- ✅ نظام مصادقة آمن باستخدام JWT
- ✅ قاعدة بيانات PostgreSQL على Azure

---

## 🏗️ البنية المعمارية (Architecture)

### التقنيات المستخدمة (Tech Stack)

#### Backend
- **Framework**: FastAPI (Python)
- **Database**: Azure Database for PostgreSQL
- **AI**: Azure OpenAI (Text Embeddings)
- **Authentication**: JWT (JSON Web Tokens)
- **Libraries**: SQLAlchemy, Passlib, Python-Jose

#### Frontend
- **Framework**: React
- **State Management**: React Hooks
- **HTTP Client**: Axios/Fetch
- **UI Pattern**: Optimistic UI Updates

#### Cloud Infrastructure
- **Platform**: Microsoft Azure
- **Database**: Azure Database for PostgreSQL
- **AI Service**: Azure OpenAI Service
- **Deployment**: Azure App Service (Backend) + Azure Static Web Apps (Frontend)

---

## 📊 تصميم قاعدة البيانات (Database Schema)

### الجداول الأساسية

#### 1. جدول المستخدمين (users)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ambassador',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**الحقول:**
- `id`: المعرف الفريد للمستخدم
- `email`: البريد الإلكتروني (فريد)
- `full_name`: الاسم الكامل
- `password_hash`: كلمة المرور المشفرة (Bcrypt)
- `role`: الدور (ambassador أو manager)
- `created_at`: تاريخ إنشاء الحساب

#### 2. جدول المقترحات (suggestions)
```sql
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    embedding vector(1536),
    vote_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vote_count ON suggestions(vote_count DESC);
```

**الحقول:**
- `id`: المعرف الفريد للمقترح
- `user_id`: معرف المستخدم صاحب المقترح
- `title`: عنوان المقترح
- `description`: الوصف التفصيلي
- `embedding`: Vector للذكاء الاصطناعي (1536 بُعد)
- `vote_count`: عدد الأصوات - **مفهرس للسرعة**
- `status`: الحالة (pending, approved, rejected)
- `created_at`: تاريخ الإنشاء

**ملاحظة هندسية مهمة:** الـ Index على `vote_count DESC` يجعل استعلام الترتيب فوريًا حتى مع 10,000 سجل.

#### 3. جدول الأصوات (votes)
```sql
CREATE TABLE votes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, suggestion_id)
);
```

**الغرض:** منع التصويت المكرر من نفس المستخدم على نفس المقترح.
- **Composite Primary Key**: (user_id, suggestion_id) يضمن سجل واحد فقط لكل مستخدم ومقترح.

---

## 🔐 نظام المصادقة (Authentication Flow)

### التدفق الكامل

#### 1. التسجيل (Sign Up)
```
User → Enter (Name, Email, Password)
Backend → Hash Password with Bcrypt
Backend → Save to Database
Backend → Return Success
```

#### 2. تسجيل الدخول (Login)
```
User → Enter (Email, Password)
Backend → Find User in Database
Backend → Compare Password Hash
Backend → Generate JWT Token
Backend → Return Token to Frontend
```

#### 3. الطلبات المصرح بها (Authenticated Requests)
```
Frontend → Send Request with Token in Header
Backend → Verify Token
Backend → Extract user_id from Token
Backend → Process Request
```

**رمز JWT يحتوي على:**
```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "exp": 1735689600
}
```

---

## ⚡ منطق التصويت (Voting Logic)

### التدفق الكامل للتصويت

#### السيناريو 1: تصويت جديد (New Vote)
```python
1. التحقق: هل يوجد سجل في جدول votes للمستخدم + المقترح؟
   → إذا لا:
      - إضافة سجل جديد في جدول votes
      - تحديث vote_count في جدول suggestions (+1)
      - إرجاع العدد الجديد للواجهة
```

#### السيناريو 2: إلغاء التصويت (Remove Vote - اختياري)
```python
1. التحقق: هل يوجد سجل في جدول votes؟
   → إذا نعم:
      - حذف السجل من جدول votes
      - تحديث vote_count في جدول suggestions (-1)
      - إرجاع العدد الجديد للواجهة
```

### SQL للاستعلامات الرئيسية

#### الحصول على القائمة المرتبة
```sql
SELECT * FROM suggestions 
ORDER BY vote_count DESC;
```
**النتيجة:** المقترح صاحب 150 صوت يظهر أولاً، والمقترح صاحب 2 صوت يظهر أخيرًا.

#### التحقق من التصويت
```sql
SELECT EXISTS(
    SELECT 1 FROM votes 
    WHERE user_id = $1 AND suggestion_id = $2
);
```

---

## 🎨 تجربة المستخدم (Frontend UX)

### واجهة بطاقة المقترح (Suggestion Card)

```
┌─────────────────────────────────────┐
│  👍 142                   [صوّت]  │
│                                     │
│  تحسين حدود Azure Credits          │
│  للطلاب في مشاريع الـ ML            │
│                                     │
│  بواسطة: علي العربي                │
│  منذ: 3 أيام                       │
└─────────────────────────────────────┘
```

**العناصر:**
- **عداد الأصوات** (`142`): بارز، لون Azure Blue، خط عريض
- **زر التصويت**: يتغير لونه إذا صوّت المستخدم مسبقًا
- **الموضع**: العداد في الزاوية اليمنى العلوية

### Optimistic UI (التحديث الفوري)

**المشكلة التقليدية:**
```
1. المستخدم يضغط "صوّت"
2. الانتظار للسيرفر... (1-2 ثانية)
3. تحديث الرقم في الواجهة
❌ يشعر المستخدم بالبطء
```

**الحل الاحترافي (Optimistic UI):**
```javascript
// الحالة الحالية: vote_count = 50
// المستخدم يضغط "صوّت"

// 1. تحديث فوري في React State
setVoteCount(51); // ← يظهر فورًا للمستخدم

// 2. إرسال الطلب للسيرفر في الخلفية
try {
    await api.post('/vote', { suggestion_id });
    // ✅ نجح - الرقم صحيح
} catch (error) {
    // ❌ فشل - إرجاع الرقم القديم
    setVoteCount(50);
    showError("فشل التصويت، حاول مرة أخرى");
}
```

**النتيجة:** المستخدم يرى التغيير فورًا، التطبيق يبدو سريعًا جدًا.

---

## 🤖 الذكاء الاصطناعي (AI-Powered Duplicate Detection)

### المشكلة
```
السفير "سارة" تكتب: "نحتاج إلى Azure credits أفضل للطلاب"
السفير "علي" كتب سابقاً: "زيادة حدود Azure credit لمشاريع الـ ML"
```
**بدون AI:** مقترحان منفصلان، تشتت الأصوات.
**مع AI:** دمج ذكي.

### آلية العمل

#### 1. عند إنشاء مقترح جديد
```python
# الخطوة 1: تحويل النص إلى Vector
user_text = "نحتاج إلى Azure credits أفضل للطلاب"
embedding = get_openai_embedding(user_text)

# الخطوة 2: البحث عن مقترحات مشابهة
similar_suggestions = find_similar_suggestions(embedding, threshold=0.85)

# الخطوة 3: إذا وُجدت مطابقة
if similar_suggestions:
    return {
        "duplicate_found": True,
        "existing_suggestion": similar_suggestions[0],
        "message": "مقترح مشابه موجود بالفعل مع 45 صوت. هل تريد التصويت عليه بدلاً من ذلك؟"
    }
```

#### 2. رد فعل الواجهة (Frontend Response)
```javascript
// عرض نافذة تأكيد
if (response.duplicate_found) {
    showDialog({
        title: "مقترح مشابه موجود",
        message: response.message,
        buttons: [
            { text: "نعم، صوّت عليه", action: () => voteExisting(response.existing_suggestion.id) },
            { text: "لا، أنشئ مقترح جديد", action: () => createNew() }
        ]
    });
}
```

#### 3. النتيجة
```
السفيرة سارة تضغط "نعم"
→ لا يتم إنشاء مقترح جديد
→ يتم تسجيل صوتها على مقترح علي
→ المقترح يقفز من 45 إلى 46 صوت
→ يرتفع في القائمة تلقائياً
```

### خوارزمية التشابه (Cosine Similarity)
```sql
-- PostgreSQL with pgvector extension
SELECT id, title, vote_count,
       1 - (embedding <=> $1) as similarity
FROM suggestions
WHERE 1 - (embedding <=> $1) > 0.85  -- عتبة التشابه
ORDER BY similarity DESC
LIMIT 3;
```

**$1**: الـ embedding vector للمقترح الجديد.
**0.85**: إذا كان التشابه > 85%، يعتبر مكرر.

---

## 📁 هيكل المشروع (Project Structure)

### Backend (Python/FastAPI)
```
/ambassador-voice-backend
│
├── .env                      # ⚠️ لا ترفعه على Git
├── .env.example              # النموذج للآخرين
├── requirements.txt          # قائمة المكتبات
├── main.py                   # نقطة الدخول الرئيسية
│
├── /core
│   └── config.py             # إعدادات التطبيق
│
├── /database
│   ├── connection.py         # الاتصال بـ PostgreSQL
│   └── models.py             # SQLAlchemy Models
│
├── /routers
│   ├── auth.py               # Login & Register
│   ├── suggestions.py        # Create & List Suggestions
│   └── votes.py              # Voting Logic
│
├── /utils
│   ├── security.py           # Password Hashing & JWT
│   └── ai.py                 # OpenAI Embedding Functions
│
└── /scripts
    └── database_setup.sql    # جداول PostgreSQL
```

### Frontend (React)
```
/ambassador-voice-frontend
│
├── package.json
├── .env
│
├── /public
│   └── index.html
│
├── /src
│   ├── App.js
│   ├── index.js
│   │
│   ├── /components
│   │   ├── SuggestionCard.jsx      # بطاقة المقترح
│   │   ├── VoteButton.jsx          # زر التصويت
│   │   ├── SuggestionList.jsx      # القائمة المرتبة
│   │   └── DuplicateDialog.jsx     # نافذة التشابه
│   │
│   ├── /services
│   │   └── api.js                  # Axios API Calls
│   │
│   └── /hooks
│       └── useOptimisticVote.js    # Custom Hook للتحديث الفوري
```

---

## 🚀 خطة التنفيذ الكاملة (Implementation Roadmap)

### المرحلة 1: الأساسيات (Foundation) ✅

#### الخطوة 1.1: إعداد قاعدة البيانات
```bash
# الاتصال بـ Azure PostgreSQL
psql -h <your-server>.postgres.database.azure.com -U <username> -d postgres

# تشغيل السكريبت
\i scripts/database_setup.sql
```

#### الخطوة 1.2: إعداد البيئة Python
```bash
# إنشاء بيئة افتراضية
python -m venv venv
venv\Scripts\activate  # Windows

# تثبيت المكتبات
pip install -r requirements.txt
```

#### الخطوة 1.3: ملف الإعدادات (.env)
```ini
DATABASE_URL=postgresql://user:pass@server.postgres.database.azure.com:5432/postgres
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
SECRET_KEY=generate-a-random-secret-string-here
ALGORITHM=HS256
```

---

### المرحلة 2: نظام المصادقة (Authentication) ✅

#### الملفات المطلوبة:
1. `utils/security.py` - وظائف التشفير والـ JWT
2. `routers/auth.py` - نقاط النهاية (Login/Register)
3. `core/config.py` - قراءة الإعدادات من .env

#### الاختبار:
```bash
# تشغيل السيرفر
uvicorn main:app --reload

# اختبار التسجيل
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securepass","full_name":"Test User"}'

# اختبار تسجيل الدخول
curl -X POST http://localhost:8000/auth/login \
  -d "username=test@example.com&password=securepass"
```

---

### المرحلة 3: نظام المقترحات والتصويت (Core Features) ✅

#### الملفات المطلوبة:
1. `routers/suggestions.py` - إنشاء واستعراض المقترحات
2. `routers/votes.py` - منطق التصويت
3. `utils/ai.py` - كشف التكرار بالذكاء الاصطناعي

#### نقاط النهاية (API Endpoints):
```python
# المقترحات
GET    /suggestions              # القائمة المرتبة
POST   /suggestions              # إنشاء مقترح جديد
GET    /suggestions/{id}         # تفاصيل مقترح

# التصويت
POST   /votes/{suggestion_id}    # تصويت/إلغاء تصويت
GET    /votes/my-votes           # مقترحاتي المصوت عليها
```

---

### المرحلة 4: الواجهة الأمامية (Frontend) ✅

#### إنشاء مشروع React:
```bash
npx create-react-app ambassador-voice-frontend
cd ambassador-voice-frontend
npm install axios
```

#### المكونات الرئيسية:

**1. SuggestionCard.jsx**
```jsx
function SuggestionCard({ suggestion, onVote }) {
  const [voteCount, setVoteCount] = useState(suggestion.vote_count);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    // Optimistic UI
    setVoteCount(prev => prev + 1);
    setIsVoting(true);

    try {
      await onVote(suggestion.id);
    } catch (error) {
      setVoteCount(prev => prev - 1); // Rollback
      alert("فشل التصويت");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="suggestion-card">
      <div className="vote-badge">{voteCount} 👍</div>
      <h3>{suggestion.title}</h3>
      <p>{suggestion.description}</p>
      <button onClick={handleVote} disabled={isVoting}>
        صوّت
      </button>
    </div>
  );
}
```

**2. SuggestionList.jsx**
```jsx
function SuggestionList() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/suggestions')
      .then(res => res.json())
      .then(data => setSuggestions(data));
  }, []);

  return (
    <div className="suggestion-list">
      {suggestions.map(s => (
        <SuggestionCard key={s.id} suggestion={s} />
      ))}
    </div>
  );
}
```

---

### المرحلة 5: النشر على Azure (Deployment) 🚀

#### Backend: Azure App Service
```bash
# إنشاء App Service
az webapp up \
  --name ambassador-voice-api \
  --resource-group VoteAI-RG \
  --runtime "PYTHON:3.11"

# ضبط المتغيرات البيئية
az webapp config appsettings set \
  --name ambassador-voice-api \
  --settings DATABASE_URL="..." AZURE_OPENAI_API_KEY="..."
```

#### Frontend: Azure Static Web Apps
```bash
# بناء المشروع
npm run build

# النشر
az staticwebapp create \
  --name ambassador-voice-frontend \
  --resource-group VoteAI-RG \
  --location "East US"
```

---

## 🎯 النتائج المتوقعة (Expected Outcomes)

### 1. قائمة ذاتية الترتيب (Self-Sorting)
- المقترح صاحب 150 صوت يظهر دائمًا في الأعلى
- التحديث تلقائي مع كل صوت جديد
- لا حاجة لتدخل يدوي في الترتيب

### 2. لا ضجيج (No Noise)
- بدلاً من 50 بريد إلكتروني عن نفس الخطأ
- يرى المدير مقترح واحد بـ 50 صوت
- الأولويات واضحة ومبنية على البيانات

### 3. مشاركة المجتمع (Community Driven)
- السفراء يشعرون أن صوتهم مسموع
- يرون الرقم يزيد فوريًا عند التصويت
- التفاعل يشجع المشاركة

### 4. قرارات مبنية على البيانات
- المدراء يرون الأولويات الحقيقية
- لا حاجة للتخمين عن المهم
- الموارد تُخصص حسب احتياجات المجتمع

---

## 📚 الملفات المرفقة (Files to Create)

### 1. قاعدة البيانات
- ✅ `scripts/database_setup.sql` - جداول PostgreSQL

### 2. Backend
- ✅ `requirements.txt` - مكتبات Python
- ✅ `.env.example` - نموذج الإعدادات
- ✅ `main.py` - نقطة الدخول
- ✅ `core/config.py` - الإعدادات
- ✅ `database/connection.py` - اتصال DB
- ✅ `utils/security.py` - التشفير والـ JWT
- ✅ `utils/ai.py` - الذكاء الاصطناعي
- ✅ `routers/auth.py` - المصادقة
- ✅ `routers/suggestions.py` - المقترحات
- ✅ `routers/votes.py` - التصويت

### 3. Frontend
- ✅ React Components (SuggestionCard, VoteButton, etc.)
- ✅ API Service Layer
- ✅ Custom Hooks

---

## 🔧 الأوامر السريعة (Quick Commands)

### تشغيل Backend محلياً
```bash
cd ambassador-voice-backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### تشغيل Frontend محلياً
```bash
cd ambassador-voice-frontend
npm start
```

### اختبار API
```bash
# الحصول على القائمة المرتبة
curl http://localhost:8000/suggestions

# تسجيل دخول
curl -X POST http://localhost:8000/auth/login \
  -d "username=test@example.com&password=pass123"

# تصويت (بعد الحصول على Token)
curl -X POST http://localhost:8000/votes/suggestion-id-here \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 👨‍💻 ملاحظات المهندس الأول (Senior Engineer Notes)

### أفضل الممارسات المطبقة:
1. ✅ **Database Indexing** - استعلامات الترتيب فورية
2. ✅ **Composite Primary Keys** - منع التكرار على مستوى DB
3. ✅ **Password Hashing** - Bcrypt مع Salt
4. ✅ **JWT Tokens** - Stateless Authentication
5. ✅ **Optimistic UI** - تجربة مستخدم سريعة
6. ✅ **AI-Powered Deduplication** - منع الضجيج
7. ✅ **Separation of Concerns** - كل ملف له مسؤولية واحدة
8. ✅ **Environment Variables** - الأسرار خارج الكود

### الأمان (Security Considerations):
- كلمات المرور مُشفرة ببcrypt (لا تُخزن بالنص الواضح)
- الـ Tokens تنتهي بعد 30 دقيقة
- الـ CORS مضبوط للسماح فقط للواجهة الأمامية
- SQL Injection محمي بواسطة SQLAlchemy Parameterized Queries

### قابلية التوسع (Scalability):
- الـ Index على `vote_count` يسمح بـ 100,000 سجل بدون تباطؤ
- الـ Vector Search مُحسّن بـ pgvector
- الـ Database Connection Pool يتعامل مع 100+ طلب متزامن

---

## 📞 الدعم والمساعدة

إذا واجهت مشكلة في أي خطوة:
1. تحقق من ملف `.env` - معظم المشاكل تأتي من الإعدادات الخاطئة
2. راجع Logs السيرفر - `uvicorn` يعرض أخطاء واضحة
3. استخدم Postman لاختبار الـ API مباشرة
4. تأكد من تثبيت جميع المكتبات في `requirements.txt`

---

## 🎉 الخلاصة

هذا المشروع ليس مجرد "صندوق مقترحات"، بل هو **محرك تحديد الأولويات** يعتمد على:
- 🗳️ آراء المجتمع الحقيقية (من خلال التصويت)
- 🤖 الذكاء الاصطناعي (لتنظيم الأفكار ودمج المتشابه)
- ⚡ تجربة مستخدم سريعة (Optimistic UI)
- 📊 بيانات واضحة لصناع القرار (الترتيب التلقائي)

**جاهز للبدء؟** لننفذ الكود خطوة بخطوة! 🚀