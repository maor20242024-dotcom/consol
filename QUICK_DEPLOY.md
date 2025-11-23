# 🚀 Quick Deployment Guide

**Get IMPERIUM GATE deployed to production in 15 minutes!**

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account with this repository
- [ ] Vercel account (free at [vercel.com](https://vercel.com))
- [ ] Supabase project (free at [supabase.com](https://supabase.com))
- [ ] Database schema pushed (`npm run db:push`)

---

## Step 1: Prepare Supabase (5 minutes)

### Get Your Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project (or create a new one)
3. Navigate to **Settings** → **API**

Copy these 3 values:
```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc...
```

4. Navigate to **Settings** → **Database** → **Connection String**

Get these 2 connection strings:
- **Session Pooler** (port 6543) - for DATABASE_URL
- **Direct Connection** (port 5432) - for DIRECT_URL

Copy both and save them.

---

## Step 2: Deploy to Vercel (5 minutes)

### Option A: Via Vercel Dashboard (Easier)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select `maor20242024-dotcom/consol`
   - Click "Import"

2. **Add Environment Variables**
   
   Click "Add Environment Variables" and paste:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   DATABASE_URL=postgresql://postgres:[password]@...pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[password]@...pooler.supabase.com:5432/postgres
   NODE_ENV=production
   ```

   **Important Notes:**
   - DATABASE_URL must use port **6543** and include `?pgbouncer=true`
   - DIRECT_URL must use port **5432**
   - Replace `[password]` with your actual database password

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

### Option B: Via Command Line (For Pros)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add DIRECT_URL

# Redeploy with environment variables
vercel --prod
```

---

## Step 3: Verify Deployment (5 minutes)

### Check These Routes

Visit your deployed app and test:

1. **Homepage** - `https://your-app.vercel.app/en`
   - [ ] Loads without errors
   - [ ] Language switcher works

2. **Login** - `https://your-app.vercel.app/en/login`
   - [ ] Login page displays
   - [ ] Can create account
   - [ ] Can login

3. **Dashboard** - `https://your-app.vercel.app/en/dashboard`
   - [ ] Shows data (after login)
   - [ ] No console errors

4. **Check Health** - `https://your-app.vercel.app/api/health`
   - [ ] Returns `{"status":"ok",...}`

### If Everything Works ✅

**Congratulations!** Your app is live! 🎉

Share your URL: `https://your-app.vercel.app`

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# This usually means a dependency issue
# Vercel should handle this automatically
# If not, check package.json for typos
```

**Error: Font loading failed**
```bash
# Network restrictions during build
# This is handled in production
# You can safely ignore during local builds
```

### Database Connection Issues

**Error: "Cannot connect to database"**

Double-check:
1. DATABASE_URL uses port **6543** (pooler)
2. DIRECT_URL uses port **5432** (direct)
3. DATABASE_URL includes `?pgbouncer=true`
4. Password is correct (no spaces)
5. Schema is pushed: `npm run db:push`

**Quick Fix:**
```bash
# Re-copy connection strings from Supabase
# Settings → Database → Connection String
# Make sure you're copying the right ones:
# - "Session pooler" for DATABASE_URL
# - "Direct connection" for DIRECT_URL
```

### Environment Variables Not Working

**Check Vercel Dashboard:**
1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Verify all variables are set
4. Check for typos in variable names
5. Variables should be set for **Production**, **Preview**, and **Development**

**Then Redeploy:**
- Go to **Deployments**
- Click on latest deployment
- Click "..." → "Redeploy"

### Still Having Issues?

1. **Check Logs**
   - Vercel Dashboard → Your Project → Deployments → View Function Logs

2. **Try Local Build**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   npm run build
   npm start
   # Test at http://localhost:3000/en
   ```

3. **Consult Full Guides**
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
   - [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist

---

## Next Steps

### Optional Enhancements

1. **Custom Domain**
   - Vercel Dashboard → Settings → Domains
   - Add your domain
   - Update DNS settings

2. **GitHub Auto-Deploy**
   - Already configured! ✅
   - Push to `main` branch = auto deploy
   - Pull requests = preview deployments

3. **Enable Analytics**
   - Vercel Dashboard → Analytics
   - Click "Enable"
   - Free tier available

4. **Set Up Monitoring**
   - Consider: Vercel Analytics, Sentry, or LogRocket
   - Monitor errors and performance

5. **Configure CI/CD Secrets** (Optional)
   - See [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
   - Enables automated testing on PRs

---

## Summary

### What You've Done ✅

- ✅ Deployed to Vercel
- ✅ Connected to Supabase
- ✅ Environment variables configured
- ✅ Application running in production
- ✅ Both English and Arabic working
- ✅ Authentication functional

### What's Configured ✅

- ✅ Auto-deploy on Git push
- ✅ Preview deployments for PRs
- ✅ Security headers enabled
- ✅ Health check endpoint
- ✅ Docker support (if needed later)
- ✅ CI/CD pipeline ready

### Your Deployment URLs

- **Production**: `https://your-app.vercel.app`
- **English**: `https://your-app.vercel.app/en`
- **Arabic**: `https://your-app.vercel.app/ar`
- **Health Check**: `https://your-app.vercel.app/api/health`

---

## Need More Help?

### Documentation
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- 📋 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-flight checklist
- 🔧 [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - CI/CD setup
- 📚 [README.md](./README.md) - Main documentation

### External Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**🎉 Congratulations on your deployment!**

*Last Updated: November 2024*
