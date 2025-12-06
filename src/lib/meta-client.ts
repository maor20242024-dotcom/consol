/**
 * Meta Graph API Client
 * مركزي لإدارة جميع تكاملات Meta (Facebook, Instagram, WhatsApp)
 */

import { createHmac } from 'crypto';

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v19.0";
const GRAPH_BASE = process.env.META_GRAPH_API_BASE_URL || "https://graph.facebook.com";

/**
 * إنشاء URL كامل لـ Graph API
 * @param path - مسار الـ API (مثال: "/me/messages")
 * @returns - URL كامل
 */
export const graphUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${GRAPH_BASE}/${GRAPH_VERSION}${cleanPath}`;
};

/**
 * إنشاء Headers موحدة لطلبات Meta API
 * @param accessToken - Token للمصادقة
 * @returns - Headers object
 */
export const metaHeaders = (accessToken: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
});

/**
 * التحقق من صلاحية Access Token
 * @param accessToken - Token للتحقق
 * @returns - معلومات الـ Token
 */
export async function verifyToken(accessToken: string) {
  try {
    const response = await fetch(
      graphUrl('/debug_token'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          input_token: accessToken,
          access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[META TOKEN VERIFICATION ERROR]', error);
    throw error;
  }
}

/**
 * جلب معلومات الصفحة (Page Info)
 * @param pageId - معرف الصفحة
 * @param accessToken - Token للمصادقة
 * @returns - معلومات الصفحة
 */
export async function getPageInfo(pageId: string, accessToken: string) {
  try {
    const response = await fetch(
      graphUrl(`/${pageId}?fields=id,name,username,instagram_business_account,followers_count`),
      {
        headers: metaHeaders(accessToken),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[META PAGE INFO ERROR]', error);
    throw error;
  }
}

/**
 * جلب معلومات حساب Instagram Business
 * @param igAccountId - معرف حساب Instagram
 * @param accessToken - Token للمصادقة
 * @returns - معلومات حساب Instagram
 */
export async function getInstagramAccountInfo(igAccountId: string, accessToken: string) {
  try {
    const response = await fetch(
      graphUrl(`/${igAccountId}?fields=id,username,followers_count,follows_count,media_count,account_type`),
      {
        headers: metaHeaders(accessToken),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[META INSTAGRAM INFO ERROR]', error);
    throw error;
  }
}

interface SendMessageParams {
  pageId?: string; // If not provided, defaults to 'me'
  recipientId: string;
  message: string;
  accessToken: string;
  retryCount?: number;
}

/**
 * إرسال رسالة عبر Instagram Direct
 */
export async function sendInstagramMessage(params: SendMessageParams): Promise<any> {
  const { pageId = 'me', recipientId, message, accessToken, retryCount = 0 } = params;

  // Simple retry logic
  const maxRetries = 2;

  try {
    const response = await fetch(
      graphUrl(`/${pageId}/messages`),
      {
        method: 'POST',
        headers: metaHeaders(accessToken),
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          message: {
            text: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Instagram API Error (Attempt ${retryCount + 1}):`, errorData);

      if (retryCount < maxRetries && response.status >= 500) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return sendInstagramMessage({ ...params, retryCount: retryCount + 1 });
      }
      throw new Error(errorData);
    }

    return await response.json();
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(`Retrying sendInstagramMessage due to network error...`);
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
      return sendInstagramMessage({ ...params, retryCount: retryCount + 1 });
    }
    console.error('[META INSTAGRAM SEND ERROR]', error);
    throw error;
  }
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(recipientId: string, accessToken: string, pageId: string = 'me'): Promise<boolean> {
  try {
    await fetch(graphUrl(`/${pageId}/messages`), {
      method: 'POST',
      headers: metaHeaders(accessToken),
      body: JSON.stringify({
        recipient: { id: recipientId },
        sender_action: 'typing_on'
      })
    });
    return true;
  } catch (err) {
    console.error('Error sending typing indicator', err);
    return false;
  }
}

/**
 * Mark message as seen
 */
export async function markMessageAsSeen(recipientId: string, messageId: string, accessToken: string, pageId: string = 'me'): Promise<boolean> {
  try {
    await fetch(graphUrl(`/${pageId}/messages`), {
      method: 'POST',
      headers: metaHeaders(accessToken),
      body: JSON.stringify({
        recipient: { id: recipientId },
        sender_action: 'mark_seen',
        message_id: messageId
      })
    });
    return true;
  } catch (err) {
    console.error('Error marking message as seen', err);
    return false;
  }
}

/**
 * إرسال رسالة عبر WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  recipientNumber: string,
  message: string,
  accessToken: string
) {
  try {
    const response = await fetch(
      graphUrl(`/${phoneNumberId}/messages`),
      {
        method: 'POST',
        headers: metaHeaders(accessToken),
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientNumber,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[META WHATSAPP SEND ERROR]', error);
    throw error;
  }
}

/**
 * جلب الحملات الإعلانية من Marketing API
 */
export async function getCampaigns(adAccountId: string, accessToken: string) {
  try {
    const response = await fetch(
      graphUrl(`/act_${adAccountId}/campaigns?fields=id,name,status,objective,budget_remaining,daily_budget,lifetime_budget,start_time,stop_time`),
      {
        headers: metaHeaders(accessToken),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[META CAMPAIGNS ERROR]', error);
    throw error;
  }
}

/**
 * Get Ad Sets for a campaign
 */
export async function getAdSets(campaignId: string, accessToken: string) {
  try {
    const response = await fetch(
      graphUrl(`/${campaignId}/adsets?fields=id,name,status,daily_budget,lifetime_budget,start_time,end_time,targeting`),
      { headers: metaHeaders(accessToken) }
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch ad sets:", error);
    throw error;
  }
}

/**
 * Get Ads for an Ad Set
 */
export async function getAds(adSetId: string, accessToken: string) {
  try {
    const response = await fetch(
      graphUrl(`/${adSetId}/ads?fields=id,name,status,creative{id,name,thumbnail_url,image_url,title,body}`),
      { headers: metaHeaders(accessToken) }
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    throw error;
  }
}

/**
 * جلب الإحصائيات لحملة إعلانية (أو مستوى آخر)
 */
export async function getInsights(
  objectId: string, // campaignId, adSetId, or adId works if getting specific object insights, but usually it's act_ID/insights for all
  accessToken: string,
  level: 'campaign' | 'adset' | 'ad' = 'campaign',
  datePreset: string = 'last_30d',
  isAdAccount: boolean = false
) {
  try {
    // If querying ad account (act_...), we need 'level' param. If querying object (campaign/adset), level is implied or filtered.
    // Simplifying to match generic usage:
    const path = isAdAccount ? `/act_${objectId}/insights` : `/${objectId}/insights`;

    const response = await fetch(
      graphUrl(`${path}?level=${level}&date_preset=${datePreset}&fields=campaign_id,adset_id,ad_id,impressions,clicks,ctr,cpc,spend,actions,reach,cpm`),
      {
        headers: metaHeaders(accessToken),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[META INSIGHTS ERROR]', error);
    throw error;
  }
}

export const getCampaignInsights = async (campaignId: string, accessToken: string) => {
  return getInsights(campaignId, accessToken, 'campaign', 'last_30d', false);
};

/**
 * التحقق من توقيع Webhook من Meta
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const expectedSignature = createHmac('sha256', process.env.META_APP_SECRET!)
      .update(body)
      .digest('hex');

    return `sha256=${expectedSignature}` === signature;
  } catch (error) {
    console.error('[META WEBHOOK VERIFICATION ERROR]', error);
    return false;
  }
}

/**
 * Create Instagram Media Container (Step 1 of publishing)
 */
export async function createInstagramContainer(
  igUserId: string,
  accessToken: string,
  mediaUrl: string,
  caption?: string,
  mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'
) {
  try {
    const params = new URLSearchParams({
      access_token: accessToken,
      caption: caption || '',
    });

    if (mediaType === 'IMAGE') {
      params.append('image_url', mediaUrl);
    } else {
      params.append('video_url', mediaUrl);
      params.append('media_type', 'VIDEO');
    }

    const response = await fetch(
      graphUrl(`/${igUserId}/media?${params.toString()}`),
      { method: 'POST' }
    );

    return await response.json();
  } catch (error) {
    console.error('[META INSTAGRAM CONTAINER ERROR]', error);
    throw error;
  }
}

/**
 * Publish Instagram Media Container (Step 2 of publishing)
 */
export async function publishInstagramContainer(
  igUserId: string,
  accessToken: string,
  creationId: string
) {
  try {
    const response = await fetch(
      graphUrl(`/${igUserId}/media_publish`),
      {
        method: 'POST',
        headers: metaHeaders(accessToken),
        body: JSON.stringify({
          creation_id: creationId
        })
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[META INSTAGRAM PUBLISH ERROR]', error);
    throw error;
  }
}

export default {
  graphUrl,
  metaHeaders,
  verifyToken,
  getPageInfo,
  getInstagramAccountInfo,
  sendInstagramMessage,
  sendTypingIndicator,
  markMessageAsSeen,
  sendWhatsAppMessage,
  getCampaigns,
  getAdSets,
  getAds,
  getInsights,
  getCampaignInsights,
  verifyWebhookSignature,
  createInstagramContainer,
  publishInstagramContainer,
};
