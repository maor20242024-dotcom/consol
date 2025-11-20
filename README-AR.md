
# IMPERIUM GATE — دليل المشروع (مختصر ومحدث)

هذا الملف هو النسخة العربية المجمعة والشاملة للمستندات؛ يدمج أحدث المعلومات من ملفات `docs/` ويقدّم إرشادًا احترافيًا ومرجعًا سريعًا.

محتويات سريعة
- نظرة عامة على المشروع وحالته الحالية
- تشغيل بيئة التطوير محليًا
- متغيرات البيئة الأساسيّة
- نشر سريع على Vercel
- ملاحظات حول Prisma وDATABASE_URL
- إنشاء حساب المشرف (Supabase)

الحالة الحالية
- المرحلة 1: مكتملة — نماذج قاعدة البيانات، مسارات API الأساسية، واجهات Campaigns وAd Creator.
- المرحلة 2: تمّت إضافة اقتراحات AI (نسخة محاكاة) وتحسينات UX.
- قيد التنفيذ: التحقّق من اتصال Prisma عبر `DATABASE_URL` الصحيح (راجع الفقرة أدناه).

تشغيل محلي (سريع)
1. تثبيت الحزم:
```bash
npm ci
```
2. إعداد المتغيرات:
```bash
cp .env.example .env.local
# حرّر .env.local وأدخل القيم الصحيحة (لا ترفع الملف إلى Git)
```
3. تشغيل الخادم:
```bash
npm run dev
```
افتح: `http://localhost:3001/ar` أو `/en`.

المتغيرات الضرورية
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (خادم فقط)
- `DATABASE_URL` (Prisma)
- مفاتيح LLM إن وُجدت: `OPENROUTER_API_KEY` أو `GEMINI_API_KEY`

ملاحظة أمنيّة
- غيّر أي مفاتيح تمّ كشفها فورًا. احتفظ بالمفاتيح الحسّاسة خارج متغيرات `NEXT_PUBLIC_`.

Prisma — ملاحظة هامة
- لاستخدام `npx prisma db push` عند حدوث خطأ "Tenant or user not found" استخدم سلسلة الاتصال المباشرة (Direct, port 5432) من لوحة Supabase. للمزيد راجع: `docs/PHASE1_FIXES_GUIDE.md`.

إنشاء مستخدم مسؤول (Supabase)
1. افتح Supabase → Authentication → Users → Add User
2. أدخل:
```
Email: admin@imperiumgate.com
Password: Admin123456!
```
3. فعّل Auto Confirm، ثم اجعل الحساب مسؤولًا بملف SQL:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@imperiumgate.com';
```

نشر سريع
1. حدّث متغيرات البيئة في Vercel (Settings → Environment Variables).
2. نشر عبر CLI أو Git:
```bash
vercel --prod
# أو:
git push origin main
```

فحص ما بعد النشر
- تحقق من صفحة تسجيل الدخول: `/en/login`.
- ارسل طلبات إلى `/api/instagram/campaigns` و`/api/instagram/ads` للتأكد من الاستجابة.

ملفات مرجعية (مفيدة)
- Prisma fix: `docs/PHASE1_FIXES_GUIDE.md`
- إرشادات اختبار شامل: `docs/TESTING_GUIDE.md`
- نشر مختصر: `DEPLOYMENT.md` (محدّث)
- خطوات إنشاء مستخدم: `docs/HOW_TO_CREATE_USER.md` (مختصر)

التالي — ماذا تريد أن أفعل الآن؟
1) أبني المشروع محليًا (`npm run build`) وأبلغك بالنتائج.
2) أنشئ خطة أرشفة لملفات الـ README الإضافية (أبرزها في `docs/`) وأنقل النسخ القديمة إلى `docs/ARCHIVE/` (لن أحذف شيئًا بدون موافقتك). 
3) لا شيء الآن — انتهيت من تجميع الوثائق.

أخبرني برقم الخيار الذي تريده لأتابع.
