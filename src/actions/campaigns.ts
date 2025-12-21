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
        const campaignsData = fbCampaigns.data || [];
        let totalAdSets = 0;
        let totalAds = 0;

        for (const fbCamp of campaignsData) {
            // 1. Sync Campaign
            const campaign = await prisma.campaign.upsert({
                where: { externalId: fbCamp.id },
                update: {
                    name: fbCamp.name,
                    status: fbCamp.status,
                    objective: fbCamp.objective,
                    budget: fbCamp.daily_budget ? Number(fbCamp.daily_budget) / 100 : undefined,
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

            // 2. Sync AdSets for this Campaign
            try {
                // @ts-ignore
                const adSetsData = await import("@/lib/meta-client").then(m => m.getAdSets(campaign.externalId!, accessToken));
                const adSets = adSetsData.data || [];

                for (const fbAdSet of adSets) {
                    const adSet = await prisma.adSet.upsert({
                        where: { externalId: fbAdSet.id },
                        update: {
                            name: fbAdSet.name,
                            status: fbAdSet.status,
                            budget: fbAdSet.daily_budget ? Number(fbAdSet.daily_budget) / 100 : undefined,
                            startDate: fbAdSet.start_time ? new Date(fbAdSet.start_time) : undefined,
                            endDate: fbAdSet.end_time ? new Date(fbAdSet.end_time) : undefined,
                            campaignId: campaign.id
                        },
                        create: {
                            externalId: fbAdSet.id,
                            name: fbAdSet.name,
                            status: fbAdSet.status,
                            budget: fbAdSet.daily_budget ? Number(fbAdSet.daily_budget) / 100 : undefined,
                            startDate: fbAdSet.start_time ? new Date(fbAdSet.start_time) : undefined,
                            endDate: fbAdSet.end_time ? new Date(fbAdSet.end_time) : undefined,
                            campaignId: campaign.id
                        }
                    });
                    totalAdSets++;

                    // 3. Sync Ads for this AdSet
                    try {
                        // @ts-ignore
                        const adsData = await import("@/lib/meta-client").then(m => m.getAds(adSet.externalId!, accessToken));
                        const ads = adsData.data || [];

                        for (const fbAd of ads) {
                            await prisma.ad.upsert({
                                where: { externalId: fbAd.id },
                                update: {
                                    name: fbAd.name,
                                    status: fbAd.status,
                                    previewUrl: fbAd.creative?.image_url || fbAd.creative?.thumbnail_url,
                                    adSetId: adSet.id
                                },
                                create: {
                                    externalId: fbAd.id,
                                    name: fbAd.name,
                                    status: fbAd.status,
                                    previewUrl: fbAd.creative?.image_url || fbAd.creative?.thumbnail_url,
                                    adSetId: adSet.id
                                }
                            });
                            totalAds++;
                        }
                    } catch (adError) {
                        console.error(`Failed to sync ads for AdSet ${fbAdSet.id}:`, adError);
                    }
                }
            } catch (adSetError) {
                console.error(`Failed to sync AdSets for Campaign ${fbCamp.id}:`, adSetError);
            }
        }

        return { success: true, count: campaignsData.length, adSets: totalAdSets, ads: totalAds };
    } catch (error) {
        console.error("Failed to sync campaigns:", error);
        return { success: false, error: "Failed to sync campaigns" };
    }
}

export async function syncAdInsights() {
    try {
        const accessToken = env.META_WHATSAPP_ACCESS_TOKEN;
        const adAccountId = env.FACEBOOK_AD_ACCOUNT_ID;

        if (!accessToken || !adAccountId) {
            return { success: false, error: "Missing configuration" };
        }

        // Get all active campaigns to fetch insights for
        const campaigns = await prisma.campaign.findMany({
            where: { status: { not: "ARCHIVED" } },
            select: { id: true, externalId: true }
        });

        let totalInsights = 0;

        for (const campaign of campaigns) {
            if (!campaign.externalId) continue;

            try {
                // @ts-ignore
                const insightsData = await import("@/lib/meta-client").then(m => m.getCampaignInsights(campaign.externalId!, accessToken));
                const insights = insightsData.data || [];

                for (const row of insights) {
                    await prisma.insight.create({
                        data: {
                            date: new Date(row.date_start || new Date()), // Insights usually have date_start/date_stop
                            campaignId: campaign.id,
                            impressions: Number(row.impressions || 0),
                            clicks: Number(row.clicks || 0),
                            spend: Number(row.spend || 0),
                            reach: Number(row.reach || 0),
                            cpm: Number(row.cpm || 0),
                            cpc: Number(row.cpc || 0),
                            ctr: Number(row.ctr || 0),
                            leads: Number(row.actions?.find((a: any) => a.action_type === 'lead')?.value || 0)
                        }
                    });
                    totalInsights++;
                }
            } catch (err) {
                console.error(`Failed to sync insights for campaign ${campaign.id}:`, err);
            }
        }

        return { success: true, count: totalInsights };

    } catch (error) {
        console.error("Failed to sync insights:", error);
        return { success: false, error: "Failed to sync insights" };
    }
}
