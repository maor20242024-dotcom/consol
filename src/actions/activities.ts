"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getActivities(leadId: string) {
    try {
        const activities = await prisma.activity.findMany({
            where: { leadId },
            orderBy: { createdAt: "desc" },
        });
        return activities;
    } catch (error) {
        console.error("Failed to fetch activities:", error);
        throw new Error("Failed to fetch activities");
    }
}

export async function createActivity(data: {
    leadId: string;
    type: string;
    content: string;
    performedBy?: string;
    scheduledFor?: Date;
    duration?: number;
    isCompleted?: boolean;
    aiSummary?: string;
}) {
    try {
        const activity = await prisma.activity.create({
            data: {
                leadId: data.leadId,
                type: data.type,
                content: data.content,
                performedBy: data.performedBy,
                scheduledFor: data.scheduledFor,
                duration: data.duration,
                isCompleted: data.isCompleted ?? true,
                aiSummary: data.aiSummary,
            },
        });

        revalidatePath("/[locale]/crm", "page");
        return { success: true, activity };
    } catch (error) {
        console.error("Failed to create activity:", error);
        return { success: false, error: "Failed to create activity" };
    }
}

export async function getUpcomingFollowUps() {
    try {
        const now = new Date();
        const activities = await prisma.activity.findMany({
            where: {
                scheduledFor: {
                    gte: now,
                },
                isCompleted: false,
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
            },
            orderBy: { scheduledFor: "asc" },
            take: 10,
        });
        return activities;
    } catch (error) {
        console.error("Failed to fetch upcoming follow-ups:", error);
        throw new Error("Failed to fetch upcoming follow-ups");
    }
}

export async function completeActivity(activityId: string) {
    try {
        await prisma.activity.update({
            where: { id: activityId },
            data: { isCompleted: true },
        });

        revalidatePath("/[locale]/crm", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to complete activity:", error);
        return { success: false, error: "Failed to complete activity" };
    }
}

export async function updateActivityWithAISummary(activityId: string, aiSummary: string) {
    try {
        await prisma.activity.update({
            where: { id: activityId },
            data: { aiSummary },
        });

        revalidatePath("/[locale]/crm", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to update activity:", error);
        return { success: false, error: "Failed to update activity" };
    }
}
