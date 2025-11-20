# IMPERIUM GATE — نشر سريع (مختصر)

1) إعداد المتغيرات الأساسية في لوحة Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY  # server-only
DATABASE_URL                # server-only
```

2) نشر بسرعة (CLI أو Git):

```
# عبر Vercel CLI (سريع):
vercel --prod

# أو ادفع للـ Git واسمح لـ Vercel بالنشر التلقائي
git push origin main
```

3) فحْص ما بعد النشر (اختبار أساسي):

- افتح: `https://<your-deployment>.vercel.app/en/login` وتحقق من تسجيل الدخول
- اختبر مسارات API الرئيسية مثل `/api/instagram/campaigns`
- تحقق من وجود متغيرات البيئة الصحيحة وإمكانية الاتصال بقاعدة البيانات

لمشاكل الاتصال بقاعدة البيانات راجع `docs/PHASE1_FIXES_GUIDE.md`.
