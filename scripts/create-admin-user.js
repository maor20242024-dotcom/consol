#!/usr/bin/env node

/**
 * Script to create an admin user in Supabase
 * Usage: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js');

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

async function createAdminUser() {
  try {
    const adminUser = {
      email: 'admin@imperium.local',
      password: 'Admin@123456',
      name: 'Admin User',
      role: 'superadmin'
    };

    console.log('\n🚀 IMPERIUM GATE - Admin User Creation');
    console.log('=====================================\n');
    console.log(`🔐 Creating admin user: ${adminUser.email}\n`);

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true,
      user_metadata: {
        name: adminUser.name,
        role: adminUser.role,
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
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Admin user already exists. Use this to login:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: Admin@123456\n`);
      }
      process.exit(1);
    }

    if (!data.user) {
      console.error('❌ No user returned from Supabase');
      process.exit(1);
    }

    console.log(`✅ User created successfully!`);
    console.log(`   ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}\n`);

    // Try to create user record in User table
    try {
      const { error: insertError } = await supabaseAdmin
        .from('User')
        .insert({
          id: data.user.id,
          email: adminUser.email,
          name: adminUser.name,
        });

      if (!insertError) {
        console.log('✅ User record created in database\n');
      }
    } catch (e) {
      // Table might not exist
      console.log('ℹ️  Skipping User table insert\n');
    }

    console.log('📋 Admin Account Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: Admin@123456\n`);
    console.log('✨ Admin user created with all permissions!');
    console.log('   You can now login at: http://localhost:8080/en/login\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
