# IMPERIUM GATE - Developer Instructions

This document serves as the **SINGLE SOURCE OF TRUTH** for all developers working on the **Imperium Gate** project.
**IMPORTANT:** Any updates to architecture, setup processes, or key features MUST be documented here immediately.

---

## 1. Project Overview
Imperium Gate is a comprehensive Real Estate & Business Management platform utilizing AI and social media integration.
**Core Features:**
- **CRM:** Lead management, pipelines, and import/export capabilities.
- **Campaigns:** AI-driven ad creation and management.
- **Instagram Integration:** Content management, scheduling, and direct messaging via Meta Graph API.
- **AI Assistant:** Auto-replies and chat interface utilizing multiple LLMs (OpenRouter, Gemini).
- **Voice:** (Planned/In-progress) Voice interaction capabilities.

## 2. Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase) with Prisma ORM
- **UI:** Tailwind CSS, Shadcn UI, Lucide React
- **Internationalization:** `next-intl` (English `en` & Arabic `ar`)
- **Infrastructure:** Vercel (Deployment), Supabase (Storage/Auth/DB), Ngrok (Local Webhook Testing)

## 3. Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- PostgreSQL Database URL
- Meta Developer Account (for Instagram/WhatsApp APIs)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd consol
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    - Copy `.env.example` (or ask lead dev) to `.env.local`.
    - **CRITICAL VARS:**
        - `DATABASE_URL` / `DIRECT_URL` (Supabase pooling/direct)
        - `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
        - `META_APP_ID` / `META_APP_SECRET` / `META_WEBHOOK_VERIFY_TOKEN`
        - `OPENROUTER_API_KEY` / `GEMINI_API_KEY` (For AI)

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 4. Database Management (Prisma)
The project uses **Prisma ORM**.
- **Schema Location:** `prisma/schema.prisma`
- **Push Schema changes:**
    ```bash
    npx prisma db push
    ```
    *Note: We typically use `db push` for rapid prototyping. For production, consider migrations.*
- **Open Database GUI:**
    ```bash
    npx prisma studio
    ```
- **Generate Client:** (Run automatically after install, but if needed)
    ```bash
    npx prisma generate
    ```

---

## 5. Webhooks & Messaging (Meta Integration)
We use a unified webhook handler for Instagram and WhatsApp.

### Local Development Setup (Ngrok)
We have a custom script to automate Ngrok tunneling and environment updates.
1.  **Run the setup script:**
    ```bash
    npx tsx scripts/setup-ngrok-webhook.ts
    ```
    - This will:
        - Start Ngrok.
        - Update `NGROK_URL` in `.env.local`.
        - Start the Next.js dev server.
        - Print the **Webhook URL** and **Verify Token**.

2.  **Configure Meta Dashboard:**
    - Go to [Meta Developers](https://developers.facebook.com/).
    - App Settings -> Webhooks -> "Edit Subscription".
    - Paste the **URL** (e.g., `https://xxxx.ngrok-free.app/api/webhooks/meta`) and **Token** (`imperiumgate_meta_verify_2024`).
    - Subscribe to `messages`, `messaging_postbacks`, etc.

### Key Files
- **Handler:** `src/app/api/webhooks/meta/route.ts` - Handles incoming verification (GET) and messages (POST).
- **AI Auto-Reply:** Logic located in `src/lib/ai-assistant.ts` and called within the webhook handler.
- **Meta Client:** `src/lib/meta-client.ts` - Usage of Graph API for sending messages.

---

## 6. Architecture & Key Directories
- `src/app/[locale]/`: Main application routes (Localized).
- `src/components/`: Reusable UI components.
    - `instagram/`: Components specific to Instagram features (PostCreator, ContentManager).
    - `crm/`: CRM specific components (Kanban, Tables).
- `src/lib/`: Utility functions, API clients (Prisma, Meta, AI).
- `src/messages/`: Translation files (`en.json`, `ar.json`).
- `scripts/`: Maintenance and setup scripts.

---

## 7. Internationalization (i18n)
- **Library:** `next-intl`
- **Languages:** English (`en`), Arabic (`ar`)
- **Adding Content:**
    1.  Add keys to `src/messages/en.json`.
    2.  Add corresponding keys to `src/messages/ar.json`.
    3.  Use `useTranslations('Namespace')` in components.

---

## 8. Deployment
- **Platform:** Vercel (Recommended)
- **Build Command:** `npm run build`
- **Environment Variables:** Ensure all production secrets are set in the Vercel dashboard.

---

## 9. Troubleshooting & Common Issues
- **"Media Upload 500 Error":**
    - Check `src/app/api/instagram/assets/upload/route.ts`.
    - Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct in `.env.local`.
    - Verify file size is under 50MB.
- **"Webhook Verification Failed":**
    - Ensure Ngrok is running.
    - Check if the Verify Token in Meta Dashboard matches `process.env.META_WEBHOOK_VERIFY_TOKEN`.

---

**Last Updated:** December 6, 2024
**Maintainer:** Antigravity Agent / Lead Developer
