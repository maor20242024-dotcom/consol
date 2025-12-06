#!/usr/bin/env node

/**
 * NGROK + META WEBHOOK SETUP AGENT
 * Automatically sets up ngrok and configures Meta webhooks
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';

function log(message: string) {
  console.log(`🔧 ${message}`);
}

function success(message: string) {
  console.log(`✅ ${message}`);
}

function info(message: string) {
  console.log(`⭐ ${message}`);
}

function error(message: string) {
  console.log(`❌ ${message}`);
}

async function startNgrok(): Promise<string> {
  log('Starting ngrok...');

  try {
    // Start ngrok in background
    const ngrokProcess = spawn('ngrok', ['http', '3000'], {
      stdio: 'pipe',
      detached: true
    });

    // Wait a bit for ngrok to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get ngrok URL
    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json();

    const tunnel = data.tunnels.find((t: any) => t.proto === 'https');
    if (!tunnel) {
      throw new Error('No HTTPS tunnel found');
    }

    const ngrokUrl = tunnel.public_url;
    success(`Ngrok started: ${ngrokUrl}`);
    return ngrokUrl;

  } catch (err) {
    error('Failed to start ngrok');
    error('Make sure ngrok is installed and running');
    error('Install: npm install -g ngrok');
    process.exit(1);
  }
}

async function startDevServer() {
  log('Starting Next.js dev server...');

  try {
    // Start dev server in background
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: true,
      shell: true
    });

    success('Dev server started in background');

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (err) {
    error('Failed to start dev server');
    process.exit(1);
  }
}

function updateEnvFile(ngrokUrl: string) {
  try {
    let envContent = '';
    try {
      envContent = readFileSync('.env.local', 'utf8');
    } catch (err) {
      log('.env.local not found, creating new one...');
    }

    // Update or add NGROK_URL
    const ngrokLine = `NGROK_URL=${ngrokUrl}`;
    const regex = /^NGROK_URL=.*$/m;

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, ngrokLine);
    } else {
      envContent += `\n${ngrokLine}\n`;
    }

    writeFileSync('.env.local', envContent);
    success(`Updated .env.local with NGROK_URL: ${ngrokUrl}`);

  } catch (err) {
    error('Failed to update .env.local');
    console.error(err);
  }
}

async function setupWebhook(ngrokUrl: string) {
  const webhookUrl = `${ngrokUrl}/api/webhooks/meta`;

  console.log(`\n⭐ NGROK URL:
${ngrokUrl}

⭐ FINAL META WEBHOOK URL:
${webhookUrl}

⭐ VERIFY TOKEN:
imperiumgate_meta_verify_2024`);

  return webhookUrl;
}

async function main() {
  console.log('🚀 NGROK + META WEBHOOK SETUP AGENT');
  console.log('=====================================\n');

  // Check if ngrok is available
  try {
    execSync('ngrok version', { stdio: 'ignore' });
  } catch {
    error('ngrok is not installed');
    log('Install with: npm install -g ngrok');
    process.exit(1);
  }

  // Start ngrok
  const ngrokUrl = await startNgrok();

  // Update env file with ngrok URL
  updateEnvFile(ngrokUrl);

  // Setup webhook info
  const webhookUrl = await setupWebhook(ngrokUrl);

  // Start dev server
  await startDevServer();

  console.log('\n1. Go to Meta Developer Dashboard → Webhooks');
  console.log(`2. Paste this URL:\n   ${webhookUrl}`);
  console.log('3. Paste this verify token:\n   imperiumgate_meta_verify_2024');
  console.log('4. Click VERIFY');

  // Keep process alive
  process.stdin.resume();
}

// Handle exit
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

// Run setup
main().catch(console.error);
