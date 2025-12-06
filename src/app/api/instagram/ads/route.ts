import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const campaignId = req.nextUrl.searchParams.get("campaignId");
        const status = req.nextUrl.searchParams.get("status");

        const where: Prisma.InstagramAdWhereInput = {};

        if (campaignId) {
            where.campaignId = campaignId;
        }

        if (status) {
            where.status = status;
        }

        const ads = await prisma.instagramAd.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            success: true,
            ads,
            count: ads.length,
        });
    } catch (error) {
        console.error("[INSTAGRAM_ADS_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch ads" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { campaignId, headline, description, callToAction, assets, adType } = body;

        if (!campaignId || !headline || !description) {
            return NextResponse.json(
                {
                    error:
                        "campaignId, headline, and description are required",
                },
                { status: 400 }
            );
        }

        if (!Array.isArray(assets) || assets.length === 0) {
            return NextResponse.json(
                { error: "At least one asset is required" },
                { status: 400 }
            );
        }

        if (assets.some((asset: any) => !asset?.url || typeof asset.url !== "string")) {
            return NextResponse.json(
                { error: "Each asset must include a url" },
                { status: 400 }
            );
        }

        const campaign = await prisma.instagramCampaign.findUnique({
            where: { id: campaignId },
            select: { accountId: true },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        const hasVideo = assets.some(
            (asset: any) => asset.assetType === "video"
        );
        const determinedAdType =
            typeof adType === "string" && adType.length > 0
                ? adType
                : hasVideo
                    ? "video"
                    : "image";

        const ad = await prisma.instagramAd.create({
            data: {
                accountId: campaign.accountId,
                campaignId,
                headline,
                description,
                adType: determinedAdType,
                callToAction: callToAction || "SHOP_NOW",
                status: "draft",
            },
        });

        const assetData = assets.map((asset: any) => ({
            adId: ad.id,
            assetType: asset.assetType || "image",
            url: asset.url,
            thumbnail: asset.thumbnail || asset.url,
        }));

        await prisma.adAsset.createMany({
            data: assetData,
        });

        return NextResponse.json(
            {
                success: true,
                ad,
                message: "تم إنشاء الإعلان بنجاح",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[INSTAGRAM_ADS_POST_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create ad" },
            { status: 500 }
        );
    }
}
