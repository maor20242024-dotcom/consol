import { prisma } from '@/lib/db';

/**
 * Log a system or user action to the Audit Log
 */
export async function logAudit({
    action,
    details,
    userId,
    entityId
}: {
    action: string;
    details?: string;
    userId?: string;
    entityId?: string; // Optional: ID of the affected entity (Lead, Campaign, etc.)
}) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                details: entityId ? `${details || ''} [Entity: ${entityId}]` : details,
                userId: userId, // Null for System
            }
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Don't throw, we don't want to break the main flow for logging
    }
}
