# 👑 IMPERIUM GATE

> The integrated platform for AI-powered luxury property management

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Connected-green)](https://supabase.com/)
[![Deployed](https://img.shields.io/badge/Vercel-Deployed-success)](https://vercel.com/)

## 🚀 Quick Start

```bash
# IMPERIUM GATE — Consolidated Project README

This repository contains IMPERIUM GATE: a bilingual (EN/AR) CRM and Instagram Ads management platform built with Next.js, TypeScript, Tailwind CSS, Supabase (Postgres) and Prisma. This README is the consolidated, up-to-date guide — it replaces scattered README files and aggregates the latest documentation.

Contents (high level)
- Project overview & status
- Quick start (dev)
- Environment variables (required)
- Deployment (Vercel quick steps)
- Database & Prisma notes (Prisma fix guidance)
- Admin user creation (Supabase)
- Testing checks & post-deploy validation

Project status (latest)
- Phase 1: Core features implemented (Campaigns, Ads, Asset upload, Analytics helpers).
- Phase 2: AI suggestion mock, UI/UX improvements completed.
- Remaining: Prisma direct DB connection issue — please update `DATABASE_URL` from Supabase (see below).

Quick start (development)
1. Install dependencies:
```bash
npm ci
```
2. Create local env from example and fill secrets (do NOT commit `.env.local`):
```bash
cp .env.example .env.local
# edit .env.local with required values (see Environment variables below)
```
3. Run dev server:
```bash
npm run dev
```
Open: `http://localhost:3001/en` or `/ar`.

Environment variables (required)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role (server only)
- `DATABASE_URL` — Postgres connection string (Prisma)
- `OPENROUTER_API_KEY` / `GEMINI_API_KEY` — Optional LLM keys if used

Security note: rotate any keys that were committed or exposed. Keep service keys server-only (do not prefix with `NEXT_PUBLIC_`).

Prisma / DATABASE_URL guidance (critical)
- If `npx prisma db push` fails with `FATAL: Tenant or user not found`, use the Direct Connection string from Supabase (not the pooler) for migrations. See `docs/PHASE1_FIXES_GUIDE.md`.
	- For runtime you may use pooler connection (with `?pgbouncer=true`), but for Prisma schema sync use direct host:5432 connection.

Create admin user (Supabase)
1. Open Supabase Dashboard → Authentication → Users
2. Add user with email `admin@imperiumgate.com` and password `Admin123456!` (enable Auto Confirm)
3. (Optional) Make admin via SQL:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@imperiumgate.com';
```

Deployment (Vercel — quick)
1. Add environment variables in Vercel Project Settings (same as above).
2. Deploy via CLI or Git:
```bash
vercel --prod
# or push to main and let Vercel auto-deploy
git push origin main
```
3. After deploy, test `/en/login` and API endpoints.

Testing & verification checklist
- Verify translations load (no MISSING_MESSAGE), clear `.next` if needed.
- Test API endpoints: `/api/instagram/campaigns`, `/api/instagram/ads`, `/api/instagram/assets/upload`, `/api/voice`.
- Test file upload and Supabase Storage permissions.

Where to find more details
- Prisma fix instructions: `docs/PHASE1_FIXES_GUIDE.md`
- Testing guide: `docs/TESTING_GUIDE.md`
- Short deployment steps: `DEPLOYMENT.md` (root)
- Creation and setup: `docs/HOW_TO_CREATE_USER.md`

Next actions I can take (pick one):
1. Build locally now (`npm run build`) and report errors.
2. Create/update `README-AR.md` in project root with the Arabic consolidated translation.
3. Prepare an archive plan to move other READMEs into `docs/ARCHIVE/` (will not delete without approval).

Tell me which action to run next (1 / 2 / 3) and I will proceed.
## 🌐 Available Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Redirects to `/en` | ❌ |
| `/en` or `/ar` | Landing page | ❌ |
| `/[locale]/login` | Login page | ❌ |
| `/[locale]/dashboard` | Main dashboard | ✅ |
| `/[locale]/admin` | Admin panel | ✅ |
| `/[locale]/crm` | CRM system | ✅ |
| `/[locale]/voice` | AI Voice center | ✅ |

## 🔧 Scripts

```bash
npm run dev      # Start development server (port 3001)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📖 Documentation

All documentation is in the `docs/` folder:

- **CREDENTIALS.md** - Login credentials and access info
- **SETUP_COMPLETE.md** - Complete setup guide
- **HOW_TO_CREATE_USER.md** - User creation guide
- **UPDATES.md** - Recent changes and updates
- **DESIGN_DOCUMENTATION.md** - Design system details

## 🚢 Deployment

Project is deployed on Vercel with automatic deployments from main branch.

```bash
# Deploy manually
npx vercel --prod
```

## 📝 License

All rights reserved © IMPERIUM GATE

---

**Built with 👑 by the IMPERIUM GATE team**
