# Imperium Gate Console — تشغيل سريع

## 1) المتطلبات
- Node.js 18+
- Postgres (Neon)
- Supabase (Auth فقط)

## 2) إعداد البيئة
انسخ ملف البيئة المناسب:
- `.env.local.example` -> `.env.local`

ثم عبّئ القيم المطلوبة (DATABASE_URL / SUPABASE / CRM_API_KEY).

## 3) تثبيت وتشغيل
```bash
npm install
npm run db:push
npm run dev
```

## 4) اختبار استقبال Lead (من إعلان خارجي)
```bash
curl -X POST https://console.imperiumgate.com/api/leads \
  -H "Authorization: Bearer CRM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","phone":"+971500000000","source":"landing-ad"}'
```
