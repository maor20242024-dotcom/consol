# 🚀 Deployment Guide - دليل النشر

## Quick Deployment to Vercel - النشر السريع على Vercel

### Prerequisites - المتطلبات الأساسية

1. **Vercel Account** - حساب Vercel
   - Sign up at https://vercel.com if you don't have an account
   - سجل في https://vercel.com إذا لم يكن لديك حساب

2. **Supabase Project** - مشروع Supabase
   - Create a project at https://supabase.com
   - أنشئ مشروعاً على https://supabase.com
   - Note down your project URL and API keys
   - احفظ رابط المشروع ومفاتيح API

3. **Database Setup** - إعداد قاعدة البيانات
   - PostgreSQL database from Supabase
   - قاعدة بيانات PostgreSQL من Supabase

---

## Step-by-Step Deployment - خطوات النشر

### 1. Prepare Environment Variables - تجهيز متغيرات البيئة

Copy the values from your `.env.local` file. You'll need these for Vercel:
انسخ القيم من ملف `.env.local`. ستحتاجها لـ Vercel:

**Required Variables - المتغيرات المطلوبة:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
ENCRYPTION_KEY=your_32_character_encryption_key
```

**Optional Variables - المتغيرات الاختيارية:**
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_USER_ACCESS_TOKEN=your_meta_user_access_token
META_WEBHOOK_VERIFY_TOKEN=imperiumgate_meta_verify_2024
```

### 2. Deploy to Vercel - النشر على Vercel

#### Option A: Using Vercel Dashboard (Recommended)
#### الخيار أ: استخدام لوحة تحكم Vercel (موصى به)

1. Go to https://vercel.com/new
   اذهب إلى https://vercel.com/new

2. Import your Git repository
   استورد مستودع Git الخاص بك

3. Configure project:
   إعداد المشروع:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. Add Environment Variables:
   أضف متغيرات البيئة:
   - Click on "Environment Variables"
   - انقر على "Environment Variables"
   - Add each variable from step 1
   - أضف كل متغير من الخطوة 1
   - Mark sensitive variables as "Sensitive"
   - ضع علامة على المتغيرات الحساسة كـ "Sensitive"

5. Click "Deploy"
   انقر على "Deploy"

#### Option B: Using Vercel CLI
#### الخيار ب: استخدام سطر أوامر Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Post-Deployment Setup - الإعداد بعد النشر

1. **Setup Database Schema - إعداد مخطط قاعدة البيانات**
   
   After first deployment, run:
   بعد النشر الأول، شغل:
   ```bash
   # From your local machine with Vercel CLI
   vercel env pull .env.production
   npx prisma db push
   ```

2. **Configure Meta Webhooks (if using Instagram/WhatsApp) - إعداد webhooks لـ Meta**
   
   Update your Meta App settings with:
   حدّث إعدادات تطبيق Meta بـ:
   - Webhook URL: `https://your-domain.vercel.app/api/webhooks/meta`
   - Verify Token: `imperiumgate_meta_verify_2024` (or your custom token)

3. **Test Your Deployment - اختبر النشر**
   
   Visit these URLs to verify:
   زر هذه الروابط للتحقق:
   - Homepage: `https://your-domain.vercel.app/en`
   - Login: `https://your-domain.vercel.app/en/login`
   - Dashboard: `https://your-domain.vercel.app/en/dashboard`

---

## Verification Checklist - قائمة التحقق

Before marking deployment as complete, verify:
قبل اعتبار النشر مكتملاً، تحقق من:

- [ ] Website loads successfully
      الموقع يعمل بنجاح
- [ ] Login/Authentication works
      تسجيل الدخول/المصادقة تعمل
- [ ] Database connection is successful
      اتصال قاعدة البيانات ناجح
- [ ] Environment variables are set correctly
      متغيرات البيئة معدة بشكل صحيح
- [ ] Both English and Arabic locales work
      كلا اللغتين (الإنجليزية والعربية) تعملان
- [ ] Dashboard displays data
      لوحة التحكم تعرض البيانات
- [ ] CRM functionality works
      وظائف CRM تعمل

---

## Common Issues - المشاكل الشائعة

### Build Fails - فشل البناء

**Issue:** TypeScript errors during build
**Solution:** Run locally first: `npm run validate:build`

**المشكلة:** أخطاء TypeScript أثناء البناء
**الحل:** شغل محلياً أولاً: `npm run validate:build`

### Database Connection Errors - أخطاء اتصال قاعدة البيانات

**Issue:** Cannot connect to database
**Solution:** 
- Check DATABASE_URL format
- Use connection pooling URL for production
- Verify Supabase project is active

**المشكلة:** لا يمكن الاتصال بقاعدة البيانات
**الحل:**
- تحقق من صيغة DATABASE_URL
- استخدم رابط connection pooling للإنتاج
- تحقق من أن مشروع Supabase نشط

### Missing Environment Variables - متغيرات البيئة مفقودة

**Issue:** Features not working (AI, Instagram, etc.)
**Solution:**
- Check all required env vars are set in Vercel
- Redeploy after adding missing variables

**المشكلة:** الميزات لا تعمل (AI، Instagram، إلخ)
**الحل:**
- تحقق من أن جميع متغيرات البيئة المطلوبة معدة في Vercel
- أعد النشر بعد إضافة المتغيرات المفقودة

---

## Updating Deployment - تحديث النشر

To update your deployed application:
لتحديث التطبيق المنشور:

```bash
# Push changes to your Git repository
git add .
git commit -m "Your update message"
git push origin main

# Vercel will automatically redeploy
# سيعيد Vercel النشر تلقائياً
```

Or use Vercel CLI:
أو استخدم سطر أوامر Vercel:

```bash
vercel --prod
```

---

## Support - الدعم

For issues or questions:
للمشاكل أو الأسئلة:

- Check documentation in `README.md` and `DEV_INSTRUCTIONS.md`
- Review Vercel logs: https://vercel.com/dashboard
- Check Supabase logs: https://supabase.com/dashboard

راجع التوثيق في `README.md` و `DEV_INSTRUCTIONS.md`
راجع سجلات Vercel: https://vercel.com/dashboard
راجع سجلات Supabase: https://supabase.com/dashboard
