/**
 * Instagram Message Processing Utilities
 */

import { metaWebhook } from '@/lib/logger';

// Soft-fail check
if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) {
  console.warn('[Instagram] Meta App ID/Secret missing. Integration may not work.');
}

export interface InstagramMessageEvent {
  sender: {
    id: string;
    username?: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  message?: {
    text: string;
    mid: string;
  };
}

export interface InstagramWebhookEntry {
  id: string;
  time: number;
  messaging: InstagramMessageEvent[];
}

export interface InstagramWebhookPayload {
  object: string;
  entry: InstagramWebhookEntry[];
}

/**
 * Parse raw Instagram webhook event
 */
export function parseInstagramMessage(event: any): InstagramMessageEvent | null {
  try {
    if (!event || typeof event !== 'object') {
      metaWebhook('Invalid event structure', event);
      return null;
    }

    const messageEvent: InstagramMessageEvent = {
      sender: {
        id: event.sender?.id || '',
        username: event.sender?.username
      },
      recipient: {
        id: event.recipient?.id || ''
      },
      timestamp: event.timestamp || Date.now(),
    };

    if (event.message) {
      messageEvent.message = {
        text: event.message.text || '',
        mid: event.message.mid || ''
      };
    }

    return messageEvent;
  } catch (error) {
    metaWebhook('Error parsing Instagram message', error);
    return null;
  }
}

/**
 * Normalize Instagram message for database storage
 */
export function normalizeInstagramMessage(event: InstagramMessageEvent): {
  externalId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: Date;
  source: string;
} {
  return {
    externalId: event.message?.mid || `ig_${Date.now()}`,
    senderId: event.sender.id,
    recipientId: event.recipient.id,
    text: event.message?.text || '',
    timestamp: new Date(event.timestamp),
    source: 'instagram'
  };
}

/**
 * Extract Instagram messages from webhook payload
 */
export function extractInstagramMessages(payload: any): InstagramMessageEvent[] {
  try {
    if (!payload || payload.object !== 'instagram') {
      return [];
    }

    const messages: InstagramMessageEvent[] = [];

    for (const entry of payload.entry || []) {
      if (entry.messaging && Array.isArray(entry.messaging)) {
        for (const messagingEvent of entry.messaging) {
          const parsedMessage = parseInstagramMessage(messagingEvent);
          if (parsedMessage) {
            messages.push(parsedMessage);
          }
        }
      }
    }

    metaWebhook(`Extracted ${messages.length} Instagram messages`, messages);
    return messages;
  } catch (error) {
    metaWebhook('Error extracting Instagram messages', error);
    return [];
  }
}

/**
 * Validate Instagram message event
 */
export function validateInstagramMessage(event: InstagramMessageEvent): boolean {
  return !!(
    event.sender?.id &&
    event.recipient?.id &&
    event.message?.text &&
    event.timestamp
  );
}
