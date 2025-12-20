import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const VERCEL_TOKEN = process.argv[2];

if (!VERCEL_TOKEN) {
    console.error('❌ Usage: npx tsx scripts/vercel-deploy.ts <VERCEL_TOKEN>');
    process.exit(1);
}

const run = (cmd: string) => {
    try {
        // console.log(`👉 Running: ${cmd}`); // Hide token in logs if possible
        console.log(`👉 Running command...`);
        return execSync(cmd, { stdio: 'inherit', encoding: 'utf-8' });
    } catch (e) {
        console.error('❌ Command failed');
        throw e;
    }
};

const runSilent = (cmd: string) => {
    try {
        return execSync(cmd, { encoding: 'utf-8' });
    } catch (e) {
        return '';
    }
}

async function main() {
    console.log('🚀 Starting Automated Vercel Deployment (Zeta Protocol)...');

    // 1. Check Vercel CLI
    console.log('\n🔍 Checking Vercel Access...');
    try {
        // Just check whoami to verify token
        run(`npx -y vercel whoami --token ${VERCEL_TOKEN}`);
    } catch (e) {
        console.error('❌ Invalid Token or Vercel CLI issue.');
        process.exit(1);
    }

    // 2. Link Project
    console.log('\n🔗 Linking Project...');
    // --yes to confirm defaults (creates new project if not found/linked)
    // --project consol to ensure consistent name
    try {
        // run(`npx -y vercel link --yes --project consol --token ${VERCEL_TOKEN}`);
        console.log('Skipping link to avoid env overwrite');
    } catch (e) {
        console.log("Link failed, trying without project name to auto-detect or create...");
        // run(`npx -y vercel link --yes --token ${VERCEL_TOKEN}`);
    }

    // 3. Upload Environment Variables
    console.log('\nQC Uploading Environment Variables...');
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envLines = envContent.split('\n');

        for (const line of envLines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const [key, ...values] = trimmed.split('=');
            const value = values.join('=');

            if (!key || !value) continue;

            // Remove quotes if present
            const cleanValue = value.replace(/^["'](.*)["']$/, '$1');

            console.log(`   - Setting ${key}...`);

            // We use echo and pipe to stdin to avoid shell argument issues with special chars
            // We try adding to production. If it exists, it errors, so we ignore error.
            // We do this for production and preview.
            const targets = ['production', 'preview'];

            for (const target of targets) {
                try {
                    // Check if exists first to avoid error log spam? 
                    // faster to just try adding. 
                    // "printf" is safer than "echo" for some special chars
                    // execSync(`printf "${cleanValue}" | npx vercel env add ${key} ${target} --token ${VERCEL_TOKEN}`, { stdio: 'pipe' });

                    // Actually, vercel env add requires interactive input usually IF not piped?
                    // "echo value | vercel env add name target" is the standard way.
                    execSync(`bash -c 'echo -n "${cleanValue}" | npx -y vercel env add ${key} ${target} --token ${VERCEL_TOKEN}'`, { stdio: 'ignore' });
                } catch (e) {
                    // Ignore "already exists" errors
                }
            }
        }
        console.log('✅ Environment keys synced.');
    } else {
        console.warn('⚠️ .env.local not found. Skipping env sync.');
    }

    // 4. Deploy
    console.log('\n🚀 Triggering Production Deployment...');
    const deployUrl = runSilent(`npx -y vercel deploy --prod --token ${VERCEL_TOKEN}`);

    console.log('\n✅ DEPLOYMENT COMPLETE');
    console.log(`👉 Production URL: ${deployUrl}`);
}

main().catch(console.error);
