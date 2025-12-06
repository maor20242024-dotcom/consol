import { log, error } from '@/lib/logger';
import { env } from '@/lib/env';

/**
 * Instagram Connection Status Checker
 * Verifies USER_ACCESS_TOKEN and Instagram Business account connection
 */

interface InstagramStatus {
  isConnected: boolean;
  tokenValid: boolean;
  businessAccountValid: boolean;
  accountId?: string;
  accountName?: string;
  lastChecked: Date;
  error?: string;
}

/**
 * Check Instagram connection status
 */
export async function checkInstagramConnection(): Promise<InstagramStatus> {
  const status: InstagramStatus = {
    isConnected: false,
    tokenValid: false,
    businessAccountValid: false,
    lastChecked: new Date()
  };

  try {
    log('Checking Instagram connection status...');

    // Check 1: Verify USER_ACCESS_TOKEN exists
    if (!env.META_USER_ACCESS_TOKEN) {
      status.error = 'USER_ACCESS_TOKEN not configured';
      return status;
    }

    const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v19.0";

    // Check 2: Test token validity with Graph API
    const tokenCheckUrl = `https://graph.facebook.com/${GRAPH_VERSION}/me?fields=id,name&access_token=${env.META_USER_ACCESS_TOKEN}`;

    const tokenResponse = await fetch(tokenCheckUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      status.error = tokenData.error?.message || 'Invalid USER_ACCESS_TOKEN';
      return status;
    }

    status.tokenValid = true;
    log('USER_ACCESS_TOKEN is valid');

    // Check 3: Get Instagram Business accounts
    const businessAccountsUrl = `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts?fields=instagram_business_account,access_token&access_token=${env.META_USER_ACCESS_TOKEN}`;

    const businessResponse = await fetch(businessAccountsUrl);
    const businessData = await businessResponse.json();

    if (!businessResponse.ok || businessData.error) {
      status.error = businessData.error?.message || 'Failed to fetch business accounts';
      return status;
    }

    const accounts = businessData.data || [];
    const instagramAccount = accounts.find((acc: any) => acc.instagram_business_account);

    if (!instagramAccount) {
      status.error = 'No Instagram Business account found';
      return status;
    }

    status.businessAccountValid = true;
    status.accountId = instagramAccount.instagram_business_account.id;
    status.accountName = instagramAccount.instagram_business_account.username;

    // Check 4: Test Instagram Business API access
    const igTestUrl = `https://graph.facebook.com/${GRAPH_VERSION}/${status.accountId}?fields=username,followers_count&access_token=${env.META_USER_ACCESS_TOKEN}`;

    const igResponse = await fetch(igTestUrl);
    const igData = await igResponse.json();

    if (!igResponse.ok || igData.error) {
      status.error = igData.error?.message || 'Cannot access Instagram Business account';
      return status;
    }

    status.isConnected = true;
    status.accountName = igData.username;

    log('Instagram connection fully operational', {
      accountId: status.accountId,
      username: status.accountName,
      followers: igData.followers_count
    });

  } catch (err) {
    status.error = err instanceof Error ? err.message : 'Connection check failed';
    error('Instagram connection check failed', err);
  }

  return status;
}

/**
 * Get connection status with automatic check
 */
export async function getInstagramStatus(): Promise<InstagramStatus> {
  return await checkInstagramConnection();
}

/**
 * Start automatic status checking (call on dev server start)
 */
export function startInstagramStatusMonitoring() {
  log('Starting Instagram status monitoring...');

  // Check immediately
  checkInstagramConnection().then(status => {
    if (status.isConnected) {
      log('✅ Instagram connection ready');
    } else {
      error('❌ Instagram connection issues', status.error);
    }
  });

  // Check every 5 minutes
  setInterval(async () => {
    const status = await checkInstagramConnection();
    if (!status.isConnected) {
      error('Instagram connection lost', status.error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Format status for UI display
 */
export function formatInstagramStatus(status: InstagramStatus): {
  status: 'connected' | 'disconnected' | 'error';
  message: string;
  details?: any;
} {
  if (status.isConnected) {
    return {
      status: 'connected',
      message: `Connected to @${status.accountName}`,
      details: {
        accountId: status.accountId,
        username: status.accountName,
        lastChecked: status.lastChecked
      }
    };
  }

  if (status.tokenValid) {
    return {
      status: 'error',
      message: 'Token valid but no Instagram Business account',
      details: { error: status.error }
    };
  }

  return {
    status: 'disconnected',
    message: status.error || 'Connection failed',
    details: { error: status.error }
  };
}
