"use server";

import { prisma } from "@/lib/db";
import { getCampaigns as fetchFbCampaigns } from "@/lib/meta-client";
import { env } from "@/lib/env";

export async function getCampaigns() {
    try {
        // Fetch from DB
        const campaigns = await prisma.campaign.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                insights: {
                    orderBy: { date: "desc" },
                    take: 1,
                },
            },
        });
        return campaigns;
    } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        return [];
    }
}

export async function syncCampaigns() {
    try {
        const accessToken = env.META_WHATSAPP_ACCESS_TOKEN; // Fallback or use dedicated token
        const adAccountId = env.FACEBOOK_AD_ACCOUNT_ID;

        if (!accessToken || !adAccountId) {
            console.error("Missing Meta credentials for campaign sync");
            return { success: false, error: "Missing configuration" };
        }

        const fbCampaigns = await fetchFbCampaigns(adAccountId, accessToken);
        // Meta API response format might differ slightly, usually { data: [...] }
        // meta-client.ts returns whatever fetch returns json, usually { data: [...], paging: ... }
        // We need to handle that. meta-client implementation: return await response.json();

        const campaignsData = fbCampaigns.data || [];

        for (const fbCamp of campaignsData) {
            await prisma.campaign.upsert({
                where: { externalId: fbCamp.id },
                update: {
                    name: fbCamp.name,
                    status: fbCamp.status,
                    objective: fbCamp.objective,
                    budget: fbCamp.daily_budget ? Number(fbCamp.daily_budget) / 100 : undefined, // FB returns budget in cents
                    startDate: fbCamp.start_time ? new Date(fbCamp.start_time) : undefined,
                },
                create: {
                    userId: "current-user", // TODO: Get from auth context
                    externalId: fbCamp.id,
                    name: fbCamp.name,
                    status: fbCamp.status,
                    objective: fbCamp.objective,
                    budget: fbCamp.daily_budget ? Number(fbCamp.daily_budget) / 100 : undefined,
                    startDate: fbCamp.start_time ? new Date(fbCamp.start_time) : undefined,
                    platform: "FACEBOOK",
                }
            });
        }

        return { success: true, count: campaignsData.length };
    } catch (error) {
        console.error("Failed to sync campaigns:", error);
        return { success: false, error: "Failed to sync campaigns" };
    }
}
