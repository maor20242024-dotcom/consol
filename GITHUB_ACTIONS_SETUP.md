# GitHub Actions Secrets Setup Guide

This guide explains how to set up GitHub Actions secrets for CI/CD automation.

## Required Secrets

To enable the CI/CD pipeline in `.github/workflows/ci-cd.yml`, you need to configure the following secrets in your GitHub repository.

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret listed below

---

## Secret Configuration

### 1. Vercel Deployment Secrets (Optional - for auto-deploy)

These are only needed if you want GitHub Actions to automatically deploy to Vercel.

#### `VERCEL_TOKEN`
- **Description**: Your Vercel authentication token
- **How to get**:
  1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
  2. Click "Create Token"
  3. Give it a name (e.g., "GitHub Actions")
  4. Set scope to your account/team
  5. Copy the token immediately (won't be shown again)

#### `VERCEL_ORG_ID`
- **Description**: Your Vercel organization/team ID
- **How to get**:
  1. Install Vercel CLI: `npm install -g vercel`
  2. Login: `vercel login`
  3. Link project: `vercel link`
  4. Find in `.vercel/project.json` → `orgId`
  
  Alternative:
  1. Go to Vercel dashboard settings
  2. Copy your team ID from the URL or settings page

#### `VERCEL_PROJECT_ID`
- **Description**: Your Vercel project ID
- **How to get**:
  1. Same as above: `vercel link`
  2. Find in `.vercel/project.json` → `projectId`
  
  Alternative:
  1. Go to your project in Vercel dashboard
  2. Click Settings
  3. Find Project ID in General settings

### 2. Build Environment Secrets (Optional)

These can be set if you want the CI build to use real credentials. Otherwise, dummy values are used.

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **How to get**: Supabase Dashboard → Settings → API
- **Format**: `https://xxxxx.supabase.co`
- **Note**: This is safe to expose as it's public

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Your Supabase anonymous key
- **How to get**: Supabase Dashboard → Settings → API
- **Note**: This is safe to expose as it's public

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Description**: Your Supabase service role key
- **How to get**: Supabase Dashboard → Settings → API
- **⚠️ WARNING**: Keep this secret! Never expose in client code

#### `DATABASE_URL`
- **Description**: Pooler connection string for Prisma
- **How to get**: Supabase Dashboard → Settings → Database → Connection String (Session Pooler)
- **Format**: `postgresql://postgres:[password]@...pooler.supabase.com:6543/postgres?pgbouncer=true`

#### `DIRECT_URL`
- **Description**: Direct connection string for migrations
- **How to get**: Supabase Dashboard → Settings → Database → Connection String (Direct)
- **Format**: `postgresql://postgres:[password]@...pooler.supabase.com:5432/postgres`

---

## Verification

After adding secrets, you can verify they're set correctly:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. You should see all the secrets listed (values are hidden)
3. Trigger a workflow run to test

---

## CI/CD Workflow Behavior

### Without Secrets

If you **don't** add the Vercel secrets:
- ✅ Linting will run
- ✅ Type checking will run
- ✅ Build will run (with dummy env values)
- ✅ Security audit will run
- ❌ Deployment steps will be **skipped**

### With Secrets

If you **do** add the Vercel secrets:
- ✅ All checks run
- ✅ Preview deployments for PRs
- ✅ Production deployments for main branch
- ✅ Automated deployment on every push

---

## Security Best Practices

### Do's ✅
- ✅ Use GitHub Secrets for all sensitive values
- ✅ Rotate tokens regularly
- ✅ Use different tokens for different environments
- ✅ Limit token scope to minimum required
- ✅ Review and audit secret access regularly

### Don'ts ❌
- ❌ Never hardcode secrets in code
- ❌ Never commit `.env` files
- ❌ Never expose secrets in logs
- ❌ Never share secrets via unsecured channels
- ❌ Never use production secrets in development

---

## Troubleshooting

### "Secret not found" Error

**Problem**: Workflow fails with secret not found
```
Solution:
1. Verify secret name exactly matches workflow file
2. Check secret is added to correct repository
3. Ensure secret has a value (not empty)
4. Re-add the secret if needed
```

### Deployment Fails

**Problem**: Vercel deployment fails in Actions
```
Solution:
1. Verify VERCEL_TOKEN is valid and not expired
2. Check VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct
3. Ensure Vercel project is properly set up
4. Check Vercel account has necessary permissions
```

### Build Uses Dummy Values

**Problem**: Build succeeds but with placeholder data
```
Solution:
This is expected if build secrets aren't set.
If you want real data in CI builds:
1. Add NEXT_PUBLIC_SUPABASE_URL secret
2. Add NEXT_PUBLIC_SUPABASE_ANON_KEY secret
3. Add DATABASE_URL and DIRECT_URL secrets
```

---

## Optional: Organization Secrets

If you have multiple repositories that need the same secrets:

1. Go to your **Organization** settings
2. Click **Secrets and variables** → **Actions**
3. Add secrets at organization level
4. Select which repositories can access them

This is useful for:
- Shared Vercel tokens
- Shared database credentials (for testing)
- Common API keys

---

## Example Configuration

Here's what your secrets page should look like:

```
Repository secrets (5)
├── VERCEL_TOKEN              ••••••••••••••••
├── VERCEL_ORG_ID             team_••••••••••
├── VERCEL_PROJECT_ID         prj_••••••••••••
├── NEXT_PUBLIC_SUPABASE_URL  (optional)
└── DATABASE_URL               (optional)
```

---

## Need Help?

- **GitHub Actions Docs**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Supabase Docs**: https://supabase.com/docs

---

## Summary

### Minimum Setup (Basic CI)
- No secrets needed
- Linting, type-checking, and basic builds work

### Recommended Setup (with Auto-Deploy)
- Add Vercel secrets (3 secrets)
- Enables automatic deployments
- Preview deploys for PRs

### Full Setup (Everything)
- Add Vercel secrets (3 secrets)
- Add build environment secrets (5 secrets)
- Full CI/CD with real data

**Choose the setup that matches your needs!**

---

*Last Updated: November 2024*
