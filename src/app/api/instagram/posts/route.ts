import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseUserId } from "@/lib/integration-auth";
import metaClient from "@/lib/meta-client";

export async function POST(req: NextRequest) {
    try {
        const userId = await getSupabaseUserId(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { mediaUrl, caption, scheduledAt, mediaType = "IMAGE", accountId } = await req.json();

        if (!mediaUrl) {
            return NextResponse.json({ error: "Media URL is required" }, { status: 400 });
        }

        // 1. Get Instagram Account (Credentials)
        // If accountId provided, verify ownership. If not, pick first active.
        let instagramAccount;
        if (accountId) {
            instagramAccount = await prisma.instagramAccount.findUnique({
                where: { id: accountId, userId },
            });
        } else {
            instagramAccount = await prisma.instagramAccount.findFirst({
                where: { userId, status: "active" },
            });
        }

        if (!instagramAccount) {
            return NextResponse.json(
                { error: "No active Instagram account found. Please connect one in Settings." },
                { status: 404 }
            );
        }

        // 2. Determine Initial Status
        const isScheduled = !!scheduledAt;
        const status = isScheduled ? "SCHEDULED" : "DRAFT";

        // 3. Create Record in DB
        const post = await prisma.instagramPost.create({
            data: {
                accountId: instagramAccount.id,
                userId,
                mediaUrl,
                caption,
                mediaType,
                status,
                scheduledFor: isScheduled ? new Date(scheduledAt) : null,
            },
        });

        // 4. If Publish Now (not scheduled)
        if (!isScheduled) {
            try {
                // Step 1: Create Container
                const container = await metaClient.createInstagramContainer(
                    instagramAccount.instagramUserId,
                    instagramAccount.accessToken,
                    mediaUrl,
                    caption,
                    mediaType
                );

                if (!container.id) {
                    throw new Error("Failed to create media container: No ID returned");
                }

                // Step 2: Publish Container
                const publishResult = await metaClient.publishInstagramContainer(
                    instagramAccount.instagramUserId,
                    instagramAccount.accessToken,
                    container.id
                );

                if (!publishResult.id) {
                    throw new Error("Failed to publish media: No ID returned");
                }

                // 5. Update DB Record
                await prisma.instagramPost.update({
                    where: { id: post.id },
                    data: {
                        status: "PUBLISHED",
                        publishedAt: new Date(),
                        instagramMediaId: publishResult.id,
                    },
                });

                return NextResponse.json({ success: true, post: { ...post, status: "PUBLISHED", instagramMediaId: publishResult.id } });

            } catch (metaError: any) {
                console.error("Meta API Error:", metaError);

                // Update DB with failure
                await prisma.instagramPost.update({
                    where: { id: post.id },
                    data: { status: "FAILED" },
                });

                return NextResponse.json(
                    { error: "Failed to publish to Instagram", details: metaError.message },
                    { status: 500 }
                );
            }
        }

        // If Scheduled
        return NextResponse.json({ success: true, post, message: "Post scheduled successfully" });

    } catch (error: any) {
        console.error("[INSTAGRAM_POST_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
