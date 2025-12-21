"use server";

import { prisma } from "@/lib/db";
import { getPageInfo, getInstagramAccountInfo, graphUrl, metaHeaders } from "@/lib/meta-client";
import { env } from "@/lib/env";

/**
 * Sync Instagram Account and basic media for the connected user
 */
export async function syncInstagram() {
    try {
        const accessToken = env.META_USER_ACCESS_TOKEN || env.META_WHATSAPP_ACCESS_TOKEN;
        // Ideally we need a User Access Token with 'pages_show_list', 'instagram_basic', 'instagram_manage_insights'
        // For now using what's available or assuming the dedicated token has permissions.

        if (!accessToken) {
            console.error("Missing Meta User Access Token");
            return { success: false, error: "Missing configuration" };
        }

        // 1. Get User's Pages to find connected IG account
        // We might need to iterate if multiple pages, but limiting to first found for now or specific Page ID if env var exists
        // If we have FACEBOOK_PAGE_ID in env, use it.
        // Otherwise fetch /me/accounts

        // Let's assume we fetch /me/accounts
        const accountsRes = await fetch(graphUrl('/me/accounts?fields=id,name,instagram_business_account'), {
            headers: metaHeaders(accessToken)
        });
        const accountsData = await accountsRes.json();

        const pages = accountsData.data || [];
        let syncedCount = 0;

        for (const page of pages) {
            if (page.instagram_business_account?.id) {
                const igId = page.instagram_business_account.id;

                // 2. Fetch IG Account Details
                const igInfo = await getInstagramAccountInfo(igId, accessToken);

                if (igInfo.id) {
                    // 3. Upsert IG Account
                    const account = await prisma.instagramAccount.upsert({
                        where: { instagramUserId: igInfo.id },
                        update: {
                            instagramUsername: igInfo.username,
                            followers: igInfo.followers_count || 0,
                            businessAccountId: igInfo.id,
                            accessToken: accessToken, // Store token if needed for background jobs
                            status: "active",
                            lastSyncedAt: new Date()
                        },
                        create: {
                            userId: "current-user", // TODO: Auth context
                            instagramUserId: igInfo.id,
                            instagramUsername: igInfo.username,
                            followers: igInfo.followers_count || 0,
                            businessAccountId: igInfo.id,
                            accessToken: accessToken,
                            status: "active",
                            lastSyncedAt: new Date()
                        }
                    });

                    // 4. Fetch Recent Media (Posts)
                    const mediaRes = await fetch(graphUrl(`/${igId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username&limit=20`), {
                        headers: metaHeaders(accessToken)
                    });
                    const mediaData = await mediaRes.json();
                    const posts = mediaData.data || [];

                    for (const post of posts) {
                        await prisma.instagramPost.upsert({
                            where: { instagramMediaId: post.id },
                            update: {
                                caption: post.caption,
                                mediaUrl: post.media_url || post.thumbnail_url || post.permalink,
                                mediaType: post.media_type,
                                publishedAt: new Date(post.timestamp),
                                status: "PUBLISHED"
                            },
                            create: {
                                accountId: account.id,
                                instagramMediaId: post.id,
                                caption: post.caption,
                                mediaUrl: post.media_url || post.thumbnail_url || post.permalink,
                                mediaType: post.media_type,
                                publishedAt: new Date(post.timestamp),
                                status: "PUBLISHED"
                            }
                        });
                    }
                    syncedCount++;
                }
            }
        }

        return { success: true, count: syncedCount };
    } catch (error) {
        console.error("Failed to sync Instagram:", error);
        return { success: false, error: "Failed to sync Instagram" };
    }
}
