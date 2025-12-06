import { NextResponse } from "next/server";
import crypto from "crypto";
import { env } from '@/lib/env';

/**
 * Verify webhook signature from Meta/Facebook
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  try {
    const appSecret = env.META_APP_SECRET;

    if (!appSecret) {
      console.error('Missing META_APP_SECRET environment variable');
      return false;
    }

    // Create HMAC SHA256 hash
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(body, 'utf8')
      .digest('hex');

    // Compare signatures
    return `sha256=${expectedSignature}` === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
