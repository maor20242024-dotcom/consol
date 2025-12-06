"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { LEAD_SOURCES, DEFAULT_LEAD_SOURCE, isValidLeadSource } from "@/lib/lead-sources";
import { Lead } from "@prisma/client";

export async function getPipeline() {
    try {
        const pipeline = await prisma.pipeline.findFirst({
            where: { isDefault: true },
            include: {
                stages: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!pipeline) {
            throw new Error("No default pipeline found");
        }

        return pipeline;
    } catch (error) {
        console.error("Failed to fetch pipeline:", error);
        throw new Error("Failed to fetch pipeline");
    }
}

export async function getLeads() {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                stage: true,
                pipeline: true,
                campaign: true, // 🎯 NEW: Include campaign data
            },
            orderBy: { createdAt: "desc" },
        });

        // ✅ Convert Decimal to number before sending to Client
        return leads.map(lead => ({
            ...lead,
            expectedValue: lead.expectedValue ? Number(lead.expectedValue) : null,
            budget: lead.budget || null,
        }));
    } catch (error) {
        console.error("Failed to fetch leads:", error);
        throw new Error("Failed to fetch leads");
    }
}

export async function createLead(data: {
    name: string;
    phone: string;
    email?: string;
    budget?: string;
    source?: string; // 🎯 NEW: Lead source
    campaignId?: string | null; // 🎯 NEW: Campaign ID
    pipelineId: string;
    stageId: string;
}) {
    try {
        // 🎯 NEW: Validate and normalize source
        const normalizedSource = data.source && isValidLeadSource(data.source)
            ? data.source
            : DEFAULT_LEAD_SOURCE;

        // 🎯 NEW: Verify campaign exists and user has access
        let campaignData = null;
        if (data.campaignId) {
            campaignData = await prisma.campaign.findUnique({
                where: { id: data.campaignId },
                select: { id: true, name: true }
            });

            if (!campaignData) {
                return { success: false, error: "Campaign not found" };
            }
        }

        const lead = await prisma.lead.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                budget: data.budget,
                source: normalizedSource, // 🎯 NEW: Normalized source
                campaignId: data.campaignId || null, // 🎯 NEW: Link to campaign
                pipelineId: data.pipelineId,
                stageId: data.stageId,
                status: "new", // Backward compatibility
            },
            include: {
                campaign: { // 🎯 NEW: Include campaign in response
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        platform: true
                    }
                }
            }
        });

        revalidatePath("/[locale]/crm", "page");
        return { success: true, lead };
    } catch (error) {
        console.error("Failed to create lead:", error);
        return { success: false, error: "Failed to create lead" };
    }
}

export async function updateLeadStage(leadId: string, stageId: string) {
    try {
        await prisma.lead.update({
            where: { id: leadId },
            data: { stageId },
        });

        revalidatePath("/[locale]/crm", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to update lead stage:", error);
        return { success: false, error: "Failed to update lead stage" };
    }
}

/**
 * 🎯 NEW: Get leads with filtering capabilities
 */
export async function getFilteredLeads(filters: {
    stageId?: string;
    source?: string;
    campaignId?: string;
    assignedTo?: string;
    priority?: string;
    minScore?: number;
    maxScore?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
}) {
    try {
        const {
            stageId,
            source,
            campaignId,
            assignedTo,
            priority,
            minScore,
            maxScore,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 50
        } = filters;

        const where: any = {};

        if (stageId) where.stageId = stageId;
        if (source) where.source = source;
        if (campaignId) where.campaignId = campaignId;
        if (assignedTo) where.assignedTo = assignedTo;
        if (priority) where.priority = priority;

        // Score range
        if (minScore !== undefined || maxScore !== undefined) {
            where.score = {};
            if (minScore !== undefined) where.score.gte = minScore;
            if (maxScore !== undefined) where.score.lte = maxScore;
        }

        // Date range
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        // Search (Name, Phone, Email)
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                include: {
                    stage: true,
                    pipeline: true,
                    campaign: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.lead.count({ where })
        ]);

        // ✅ Convert Decimal to number before sending to Client
        const convertedLeads = leads.map(lead => ({
            ...lead,
            expectedValue: lead.expectedValue ? Number(lead.expectedValue) : null,
            budget: lead.budget || null,
        }));

        return {
            success: true,
            leads: convertedLeads,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Failed to fetch filtered leads:", error);
        return { success: false, error: "Failed to fetch leads" };
    }
}

// ... existing code ...

export async function updateLead(leadId: string, data: Partial<Lead>) {
    try {
        await prisma.lead.update({
            where: { id: leadId },
            data: {
                ...data,
                expectedValue: data.expectedValue ? Number(data.expectedValue) : undefined,
            },
        });
        revalidatePath("/[locale]/crm", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to update lead:", error);
        return { success: false, error: "Failed to update lead" };
    }
}

export async function deleteLeads(leadIds: string[]) {
    try {
        await prisma.lead.deleteMany({
            where: { id: { in: leadIds } },
        });
        revalidatePath("/[locale]/crm", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete leads:", error);
        return { success: false, error: "Failed to delete leads" };
    }
}

/**
 * 🎯 NEW: Get available campaigns for dropdown
 */
export async function getCampaigns(userId?: string) {
    // ... existing code ...
    try {
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: 'ACTIVE', // Only active campaigns
                // TODO: Add user filtering when we implement user ownership
            },
            select: {
                id: true,
                name: true,
                status: true,
                platform: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, campaigns };
    } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        return { success: false, error: "Failed to fetch campaigns" };
    }
}
