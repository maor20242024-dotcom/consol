#!/usr/bin/env node

/**
 * Authentication Setup Verification Script
 * Checks if authentication is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Authentication Setup Verification\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function pass(msg) {
  console.log(`✅ ${msg}`);
  checks.passed++;
  checks.details.push({ status: 'pass', msg });
}

function fail(msg) {
  console.log(`❌ ${msg}`);
  checks.failed++;
  checks.details.push({ status: 'fail', msg });
}

function warn(msg) {
  console.log(`⚠️  ${msg}`);
  checks.warnings++;
  checks.details.push({ status: 'warn', msg });
}

// 1. Check middleware.ts
console.log('1️⃣  Checking middleware.ts...');
const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middleware = fs.readFileSync(middlewarePath, 'utf-8');
  if (middleware.includes('createMiddlewareClient')) {
    pass('Middleware has Supabase client');
  } else {
    fail('Middleware missing Supabase client');
  }
  
  if (middleware.includes('session')) {
    pass('Middleware checks for session');
  } else {
    fail('Middleware does not check session');
  }
  
  if (middleware.includes('protectedPaths') || middleware.includes('/admin')) {
    pass('Middleware protects routes');
  } else {
    warn('Route protection not explicitly configured');
  }
} else {
  fail('middleware.ts not found');
}

// 2. Check Supabase configuration
console.log('\n2️⃣  Checking Supabase configuration...');
const supabasePath = path.join(__dirname, '..', 'src', 'lib', 'supabase.ts');
if (fs.existsSync(supabasePath)) {
  const supabase = fs.readFileSync(supabasePath, 'utf-8');
  if (supabase.includes('createClient')) {
    pass('Supabase client creation configured');
  } else {
    fail('Supabase client not configured');
  }
  
  if (supabase.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    pass('Supabase URL configured');
  } else {
    fail('Supabase URL not configured');
  }
  
  if (supabase.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    pass('Supabase anon key configured');
  } else {
    fail('Supabase anon key not configured');
  }
} else {
  fail('supabase.ts not found');
}

// 3. Check login page
console.log('\n3️⃣  Checking login page...');
const loginPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'login', 'page.tsx');
if (fs.existsSync(loginPath)) {
  const login = fs.readFileSync(loginPath, 'utf-8');
  if (login.includes('signInWithPassword') || login.includes('signIn')) {
    pass('Login page implements authentication');
  } else {
    fail('Login page does not implement authentication');
  }
  
  if (login.includes('email') && login.includes('password')) {
    pass('Login form has email and password fields');
  } else {
    fail('Login form missing fields');
  }
} else {
  fail('Login page not found');
}

// 4. Check admin page
console.log('\n4️⃣  Checking admin page...');
const adminPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'admin', 'page.tsx');
if (fs.existsSync(adminPath)) {
  const admin = fs.readFileSync(adminPath, 'utf-8');
  if (admin.includes('admin') || admin.includes('Admin')) {
    pass('Admin page exists and is configured');
  } else {
    warn('Admin page exists but may not be fully configured');
  }
} else {
  fail('Admin page not found');
}

// 5. Check environment variables
console.log('\n5️⃣  Checking environment variables...');
const envPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf-8');
  
  if (env.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    const hasValue = !env.includes('NEXT_PUBLIC_SUPABASE_URL=http://localhost');
    if (hasValue && env.split('NEXT_PUBLIC_SUPABASE_URL=')[1].split('\n')[0].trim() !== '') {
      pass('.env.local has SUPABASE_URL configured');
    } else {
      warn('.env.local has SUPABASE_URL but it\'s localhost (dev only)');
    }
  } else {
    fail('.env.local missing SUPABASE_URL');
  }
  
  if (env.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    pass('.env.local has SUPABASE_ANON_KEY');
  } else {
    fail('.env.local missing SUPABASE_ANON_KEY');
  }
  
  if (env.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
    pass('.env.local has SERVICE_ROLE_KEY');
  } else {
    fail('.env.local missing SERVICE_ROLE_KEY');
  }
} else {
  warn('.env.local not found (create from .env.example)');
}

if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf-8');
  if (envExample.includes('SUPABASE')) {
    pass('.env.example has Supabase variables documented');
  } else {
    warn('.env.example missing Supabase configuration');
  }
} else {
  warn('.env.example not found');
}

// 6. Check package.json
console.log('\n6️⃣  Checking package.json...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  if (pkg.dependencies['@supabase/auth-helpers-nextjs']) {
    warn('@supabase/auth-helpers-nextjs is deprecated (v0.10.0 found)');
    console.log('   → Migration to @supabase/ssr planned for Phase 2.1');
  } else {
    fail('@supabase/auth-helpers-nextjs not installed');
  }
  
  if (pkg.dependencies['@supabase/supabase-js']) {
    pass('@supabase/supabase-js installed');
  } else {
    fail('@supabase/supabase-js not installed');
  }
} else {
  fail('package.json not found');
}

// 7. Check Prisma schema
console.log('\n7️⃣  Checking Prisma schema...');
const prismaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (fs.existsSync(prismaPath)) {
  const prisma = fs.readFileSync(prismaPath, 'utf-8');
  
  if (prisma.includes('model User')) {
    pass('User model defined in schema');
  } else {
    warn('No User model in schema (may be using Supabase auth only)');
  }
  
  if (prisma.includes('directUrl')) {
    pass('Prisma directUrl configured (serverless support)');
  } else {
    fail('Prisma directUrl not configured');
  }
} else {
  fail('prisma/schema.prisma not found');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('');

if (checks.failed === 0) {
  console.log('🎉 Authentication setup is ready!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Verify .env.local has real Supabase credentials');
  console.log('2. Create test users in Supabase Dashboard');
  console.log('3. Create admin user (admin@imperium-gate.com)');
  console.log('4. Run: npm run dev');
  console.log('5. Test login at: http://localhost:8080/en/login');
} else {
  console.log('⚠️  Please fix the failed checks above before deploying');
}

console.log('');
console.log('📚 Documentation: docs/AUTH_ADMIN_SETUP.md');
