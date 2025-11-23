/**
 * Script to create an admin user in Supabase
 * Usage: npx ts-node scripts/create-admin-user.ts
 * 
 * This script creates a user with admin role and all permissions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

interface AdminUserConfig {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'superadmin';
}

async function createAdminUser(config: AdminUserConfig) {
  try {
    console.log(`🔐 Creating admin user: ${config.email}`);

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: config.email,
      password: config.password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: config.name,
        role: config.role,
        permissions: [
          'admin:all',
          'users:manage',
          'campaigns:manage',
          'leads:manage',
          'instagram:manage',
          'analytics:view',
          'settings:manage',
          'api:access'
        ]
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      process.exit(1);
    }

    if (!data.user) {
      console.error('❌ No user returned from Supabase');
      process.exit(1);
    }

    console.log(`✅ User created successfully!`);
    console.log(`   ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);

    // Create user record in User table (if you have one)
    try {
      const { error: insertError } = await supabaseAdmin
        .from('User')
        .insert({
          id: data.user.id,
          email: config.email,
          name: config.name,
        });

      if (insertError && !insertError.message.includes('duplicate')) {
        console.warn('⚠️ Warning creating User record:', insertError.message);
      } else if (!insertError) {
        console.log('✅ User record created in database');
      }
    } catch (e) {
      // User table might not exist, which is ok
      console.log('ℹ️ Skipping User table insert (table may not exist yet)');
    }

    console.log('\n📋 Admin Account Credentials:');
    console.log(`   Email: ${config.email}`);
    console.log(`   Password: ${config.password}`);
    console.log('\n✨ Admin user created with all permissions!');
    console.log('   You can now login at: http://localhost:3000/en/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const adminUser: AdminUserConfig = {
    email: 'admin@imperium.local',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'superadmin'
  };

  console.log('🚀 IMPERIUM GATE - Admin User Creation');
  console.log('=====================================\n');

  await createAdminUser(adminUser);
}

main();
