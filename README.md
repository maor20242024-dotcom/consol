# 👑 IMPERIUM GATE

> The integrated platform for AI-powered luxury property management

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-SSR-green)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.11.1-blue)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

## 📋 About This Project

IMPERIUM GATE is a bilingual (EN/AR) **CRM and Instagram Ads management platform** designed for luxury property marketing. Built with **Next.js 15 (App Router)**, **Supabase**, and **Prisma**, it features:

- 🌐 **Bilingual Interface** (English & Arabic)
- 📊 **Real-time Analytics** with live data from Instagram Ads
- 💬 **CRM System** for lead management and tracking
- 🎤 **AI Voice Assistant** integration
- 📱 **Campaign Manager** with Instagram ads integration
- 🔐 **Secure Authentication** with Supabase SSR

## ✅ Recent Improvements (Phase 3)

- ✅ Upgraded Supabase auth from deprecated `auth-helpers-nextjs` to `@supabase/ssr`
- ✅ Converted Analytics & Dashboard to **Server Components** for better performance
- ✅ Replaced all **mock data** with real database queries using Prisma
- ✅ Cleaned up documentation (archived 18+ redundant README files)
- ✅ Unified Prisma client exports for consistency

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase project with PostgreSQL database
- Environment variables configured (see below)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm ci
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Push database schema to Supabase:**
   ```bash
   npx prisma db push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Open: `http://localhost:3001/en` or `http://localhost:3001/ar`

## 🔐 Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only!)
- `DATABASE_URL` — Postgres connection string (Prisma)

**Optional:**
- `OPENROUTER_API_KEY` — For OpenRouter AI services
- `GEMINI_API_KEY` — For Google Gemini AI

### Critical: Prisma & DATABASE_URL

- Use **Direct Connection** string for migrations (`npx prisma db push`)
- Use **Pooler Connection** for runtime (add `?pgbouncer=true`)
- Format: `postgresql://user:password@host:5432/database?schema=public`

## 📊 Available Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Redirects to locale | ❌ |
| `/[locale]` | Landing/home | ❌ |
| `/[locale]/login` | Login & registration | ❌ |
| `/[locale]/dashboard` | Main dashboard with KPIs | ✅ |
| `/[locale]/analytics` | Campaign analytics & reports | ✅ |
| `/[locale]/crm` | Lead management system | ✅ |
| `/[locale]/campaigns-manager` | Instagram campaign creation | ✅ |
| `/[locale]/ad-creator` | Ad builder | ✅ |
| `/[locale]/voice` | Voice assistant center | ✅ |
| `/[locale]/admin` | Admin panel | ✅ |

## 🛠️ Development Scripts

```bash
npm run dev          # Start dev server (port 3001)
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
npm run db:push      # Push schema changes to DB
npm run db:migrate   # Create migration files
npm run db:studio    # Open Prisma Studio (visual DB browser)
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to your Git repository
2. Connect your repo to Vercel: https://vercel.com/new
3. Add environment variables in Vercel Settings
4. Deploy automatically on push to main

### Manual Deployment

```bash
npx vercel --prod
```

## 📚 Documentation

Key docs are in `docs/`:

- **DATABASE_SETUP.md** — Database schema and Prisma setup
- **QUICK_START.md** — Development quickstart guide
- **DEPLOYMENT_CHECKLIST.md** — Pre-deployment checklist
- **ARCHIVE/** — Archived documentation from previous phases

> Old README files have been archived to reduce noise. All current info is in this file.

## 🔒 Security Notes

- ⚠️ Never commit `.env.local` or private keys
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only
- ⚠️ Use `NEXT_PUBLIC_*` prefix ONLY for browser-safe variables
- Rotate any exposed keys immediately in Supabase dashboard

## 🤝 Contributing

When adding features:

1. Use **Server Components** for data fetching (better performance)
2. Replace mock data with real Prisma queries
3. Test both EN and AR locales
4. Update type definitions in Prisma schema
5. Run `npm run build` before committing

## 📝 License

All rights reserved © IMPERIUM GATE

---

**Version:** 3.0 (Phase 3 - Backend Optimization)
**Last Updated:** November 2024
**Built with:** Next.js 15, Supabase SSR, Prisma, Tailwind CSS
