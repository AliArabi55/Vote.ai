# 🚀 دليل تشغيل واختبار النظام

## 📋 المتطلبات
- ✅ قاعدة البيانات جاهزة
- ✅ pgvector مُفعّل
- ✅ جميع المكتبات مثبتة

---

## 🎯 الخطوة 1: تشغيل الخادم

### افتح **نافذة PowerShell جديدة** (نافذة 1):

```powershell
cd C:\Users\aliar\OneDrive\Documents\GitHub\Vote.ai\backend
.\venv\Scripts\python.exe main.py
```

### ✅ يجب أن ترى:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**⚠️ مهم**: اترك هذه النافذة مفتوحة! الخادم يجب أن يبقى يعمل.

---

## 🧪 الخطوة 2: اختبار التسجيل

### الطريقة 1: عبر المتصفح (Swagger UI) 🌐

1. افتح المتصفح
2. اذهب إلى: **http://localhost:8000/docs**
3. ستظهر واجهة Swagger UI (زرقاء/رمادية)
4. ابحث عن قسم **Auth** (أخضر)
5. اضغط على **POST /auth/register**
6. اضغط **Try it out**
7. امسح المحتوى واكتب:

```json
{
  "email": "ali@studentambassadors.com",
  "password": "StrongPassword123!",
  "full_name": "Ali Arabi",
  "role": "manager"
}
```

8. اضغط **Execute**

### ✅ النتيجة المتوقعة:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "ali@studentambassadors.com",
  "full_name": "Ali Arabi",
  "role": "manager",
  "created_at": "2025-11-17T..."
}
```

**Status Code**: `201 Created` (باللون الأخضر)

---

### الطريقة 2: عبر سكريبت Python 🐍

افتح **نافذة PowerShell جديدة** (نافذة 2 - اترك الخادم يعمل!):

```powershell
cd C:\Users\aliar\OneDrive\Documents\GitHub\Vote.ai\backend
.\venv\Scripts\python.exe scripts\test_register.py
```

### ✅ يجب أن ترى:
```
============================================================
🧪 Testing User Registration
============================================================

📤 Sending registration request...
   Email: ali@studentambassadors.com
   Name: Ali Arabi
   Role: manager

✅ تم تسجيل المستخدم بنجاح!

📋 معلومات المستخدم:
   🆔 ID: 550e8400-...
   📧 Email: ali@studentambassadors.com
   👤 Name: Ali Arabi
   🎭 Role: manager

============================================================
✅ Test Passed!
============================================================
```

---

### الطريقة 3: عبر PowerShell مباشرة 💻

في نافذة PowerShell جديدة:

```powershell
$body = @{
    email = "test@example.com"
    password = "TestPassword123!"
    full_name = "Test User"
    role = "ambassador"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/auth/register" -Method POST -Body $body -ContentType "application/json"
```

---

## 🔐 الخطوة 3: اختبار تسجيل الدخول

### في Swagger UI:

1. اذهب إلى **POST /auth/login**
2. اضغط **Try it out**
3. في **Request body** اكتب:

```
username: ali@studentambassadors.com
password: StrongPassword123!
```

**ملاحظة**: OAuth2 يستخدم `username` بدلاً من `email`

4. اضغط **Execute**

### ✅ النتيجة المتوقعة:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**انسخ الـ `access_token`!**

---

## 🔒 الخطوة 4: اختبار المسار المحمي

### في Swagger UI:

1. اضغط على زر **Authorize** 🔓 (في الأعلى)
2. في مربع **Value** الصق الـ Token:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. اضغط **Authorize** ثم **Close**

4. اذهب إلى **GET /auth/me**
5. اضغط **Try it out**
6. اضغط **Execute**

### ✅ النتيجة المتوقعة:
```json
{
  "id": "550e8400-...",
  "email": "ali@studentambassadors.com",
  "full_name": "Ali Arabi",
  "role": "manager"
}
```

**Status Code**: `200 OK` ✅

---

## 🧪 الخطوة 5: اختبار كامل تلقائي

شغل جميع الاختبارات مرة واحدة:

```powershell
cd C:\Users\aliar\OneDrive\Documents\GitHub\Vote.ai\backend
.\venv\Scripts\python.exe scripts\test_auth.py
```

### ✅ يجب أن تنجح 6 اختبارات:
```
✅ Health check working
✅ User registration working
✅ Login and JWT token generation working
✅ Protected route authentication working
✅ Invalid token rejection working
✅ Duplicate email prevention working

🎉 All Tests Passed!
```

---

## 📊 التحقق من قاعدة البيانات

تحقق من أن المستخدم تم إضافته لقاعدة البيانات:

```powershell
.\venv\Scripts\python.exe scripts\verify_azure.py
```

يجب أن ترى:
```
📊 users: 1 rows  ✅
```

---

## 🎯 الخطوات بالترتيب

| # | الإجراء | النافذة |
|---|---------|---------|
| 1️⃣ | تشغيل الخادم | PowerShell 1 (تبقى مفتوحة) |
| 2️⃣ | فتح http://localhost:8000/docs | متصفح |
| 3️⃣ | تسجيل مستخدم جديد | Swagger UI |
| 4️⃣ | تسجيل الدخول والحصول على Token | Swagger UI |
| 5️⃣ | Authorize بالـ Token | Swagger UI |
| 6️⃣ | اختبار /auth/me | Swagger UI |
| 7️⃣ | (اختياري) تشغيل الاختبارات الآلية | PowerShell 2 |

---

## ❓ حل المشاكل

### المشكلة: "Could not connect to server"
**الحل**: تأكد أن الخادم يعمل في نافذة PowerShell منفصلة

### المشكلة: "Email already registered"
**الحل**: المستخدم موجود بالفعل! جرب email آخر أو استخدم `/auth/login`

### المشكلة: "401 Unauthorized"
**الحل**: تأكد أنك ضغطت **Authorize** ووضعت الـ Token

### المشكلة: الخادم يتوقف تلقائياً
**الحل**: لا تشغل أوامر أخرى في نفس نافذة الخادم!

---

## ✅ قائمة التحقق النهائية

- [ ] الخادم يعمل على http://localhost:8000
- [ ] Swagger UI يفتح في المتصفح
- [ ] تسجيل مستخدم جديد ينجح (201 Created)
- [ ] تسجيل الدخول يعطي access_token
- [ ] المسار المحمي /auth/me يعمل مع Token
- [ ] الاختبارات التلقائية تنجح (6/6)

---

**📅 تاريخ الإنشاء**: 17 نوفمبر 2025  
**✅ الحالة**: جاهز للتشغيل  
**🎯 الهدف**: اختبار نظام المصادقة بالكامل
