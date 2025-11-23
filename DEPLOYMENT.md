# 🚀 IMPERIUM GATE - Deployment Guide

This guide covers deploying IMPERIUM GATE to production using various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deploy to Vercel](#quick-deploy-to-vercel)
- [Environment Variables](#environment-variables)
- [Deploy to Other Platforms](#deploy-to-other-platforms)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Node.js 18+** installed
2. ✅ **Supabase Project** created and configured
3. ✅ **Database Schema** pushed to Supabase (`npm run db:push`)
4. ✅ **All Environment Variables** ready (see `.env.example`)
5. ✅ **Successful Local Build** (`npm run build`)

---

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:

   **Required Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:[password]@...pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[password]@...pooler.supabase.com:5432/postgres
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Optional Variables** (if using features):
   ```
   OPENROUTER_API_KEY=your-key
   GEMINI_API_KEY=your-key
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live at `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add DATABASE_URL
   vercel env add DIRECT_URL
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret!) | Supabase Dashboard → Settings → API |
| `DATABASE_URL` | Pooler connection string | Supabase Dashboard → Settings → Database → Connection String (Session Pooler) |
| `DIRECT_URL` | Direct connection string | Supabase Dashboard → Settings → Database → Connection String (Direct) |

### Optional Variables

| Variable | Required For | Where to Get |
|----------|--------------|--------------|
| `OPENROUTER_API_KEY` | AI voice assistant | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `GEMINI_API_KEY` | Google AI features | [makersuite.google.com](https://makersuite.google.com/app/apikey) |
| `NEXTAUTH_URL` | NextAuth authentication | Your production domain |
| `NEXTAUTH_SECRET` | NextAuth security | Generate with `openssl rand -base64 32` |

### Security Best Practices

⚠️ **CRITICAL SECURITY RULES:**

1. **Never commit** `.env.local` or `.env` files to Git
2. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` in client-side code
3. **Use encrypted** environment variables in CI/CD
4. **Rotate keys** immediately if exposed
5. **Use different keys** for staging and production

---

## Deploy to Other Platforms

### Deploy to Netlify

1. **Connect Repository**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add all required variables from `.env.example`

4. **Deploy**
   - Click "Deploy site"

### Deploy to Railway

1. **Create New Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure Service**
   - Railway will auto-detect Next.js
   - Add environment variables in the Variables tab

3. **Deploy**
   - Click "Deploy"
   - Railway will build and deploy automatically

### Deploy with Docker

1. **Create Dockerfile** (already included if exists)
   
   If not, create `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   ENV NEXT_TELEMETRY_DISABLED 1
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t imperium-gate .
   docker run -p 3000:3000 --env-file .env imperium-gate
   ```

### Deploy to AWS (EC2 or ECS)

1. **Prepare for Deployment**
   ```bash
   npm run build
   ```

2. **Create deployment package**
   ```bash
   tar -czf deploy.tar.gz .next node_modules package.json package-lock.json public
   ```

3. **Upload to EC2**
   ```bash
   scp deploy.tar.gz user@your-ec2-ip:/app/
   ssh user@your-ec2-ip
   cd /app
   tar -xzf deploy.tar.gz
   ```

4. **Set up environment**
   ```bash
   # Create .env.local with your variables
   npm install -g pm2
   pm2 start npm --name "imperium-gate" -- start
   pm2 save
   pm2 startup
   ```

---

## Post-Deployment Checklist

After deploying, verify:

### 1. Application Access
- [ ] Main domain loads correctly
- [ ] Both `/en` and `/ar` routes work
- [ ] SSL certificate is active (HTTPS)

### 2. Authentication
- [ ] Login page loads
- [ ] Can create new account
- [ ] Can login with existing account
- [ ] Session persists across page reloads

### 3. Database Connection
- [ ] Dashboard loads with real data
- [ ] Can create new records (test with CRM)
- [ ] Data persists after page reload

### 4. Key Features
- [ ] Dashboard displays analytics
- [ ] CRM loads leads
- [ ] Campaign manager works
- [ ] Voice assistant accessible (if enabled)
- [ ] Both languages switch correctly

### 5. Performance
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load correctly
- [ ] API routes respond

### 6. Security
- [ ] Environment variables not exposed in client
- [ ] Service role key not in browser
- [ ] HTTPS enforced
- [ ] Security headers present

---

## Troubleshooting

### Build Fails

**Problem:** Build fails with "Cannot find module"
```
Solution: Ensure all dependencies are installed
npm ci
npm run build
```

**Problem:** Font loading errors
```
Solution: Network restriction or Google Fonts blocked
- Use local fonts or configure proxy
- Check next.config.ts font configuration
```

### Database Connection Issues

**Problem:** "Cannot connect to database"
```
Solution: Check your DATABASE_URL and DIRECT_URL
- Ensure using correct pooler (port 6543) for DATABASE_URL
- Ensure using direct connection (port 5432) for DIRECT_URL
- Verify credentials in Supabase dashboard
- Check if ?pgbouncer=true is added to DATABASE_URL
```

**Problem:** "Prisma schema not found"
```
Solution: Generate Prisma client
npx prisma generate
npm run build
```

### Authentication Issues

**Problem:** "Supabase client error"
```
Solution: Check Supabase configuration
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- Check if variables have NEXT_PUBLIC_ prefix for client-side
- Restart your application
```

### Vercel-Specific Issues

**Problem:** Build succeeds but app crashes
```
Solution: Check environment variables
- Ensure all required variables are set in Vercel
- Verify no typos in variable names
- Check Vercel logs: vercel logs
```

**Problem:** "Function size exceeds limit"
```
Solution: Optimize your build
- Use dynamic imports for large components
- Check next.config.ts output setting
- Consider upgrading Vercel plan
```

### Performance Issues

**Problem:** Slow page loads
```
Solution: Optimize your deployment
- Enable Vercel Edge Cache
- Use next/image for images
- Implement proper loading states
- Use ISR (Incremental Static Regeneration) where possible
```

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**
   - Vercel: `vercel logs`
   - Local: Check console and terminal
   - Supabase: Check database logs in dashboard

2. **Common Commands**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   
   # Reset database
   npx prisma db push --force-reset
   
   # Check build locally
   npm run build
   npm start
   ```

3. **Resources**
   - [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
   - [Vercel Support](https://vercel.com/support)
   - [Supabase Docs](https://supabase.com/docs)
   - [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

## Continuous Deployment

### Auto-Deploy on Git Push (Vercel)

Once connected to GitHub, Vercel automatically:

1. **Builds** on every push to main branch
2. **Creates preview** deployments for pull requests
3. **Rolls back** if build fails
4. **Provides** deployment URLs instantly

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for custom CI/CD:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Production Optimization

### Performance Checklist

- [ ] Enable caching headers in `vercel.json`
- [ ] Use `next/image` for all images
- [ ] Implement lazy loading for heavy components
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Monitor performance with Vercel Analytics

### Security Hardening

- [ ] Set up security headers (already in `vercel.json`)
- [ ] Enable CORS restrictions
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular dependency updates (`npm audit`)
- [ ] Enable Vercel's security features

### Monitoring

Consider setting up:

- **Vercel Analytics** - Built-in performance monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Supabase Logs** - Database monitoring

---

## Success! 🎉

Your IMPERIUM GATE application is now deployed and running in production!

**Next Steps:**
1. Share your deployment URL with stakeholders
2. Set up monitoring and alerts
3. Plan for regular updates and maintenance
4. Consider setting up staging environment
5. Document any custom configurations

**Need Help?**
- Review this guide
- Check troubleshooting section
- Consult platform-specific documentation

---

**Last Updated:** November 2024  
**Version:** 1.0  
**Maintained by:** IMPERIUM GATE Team
