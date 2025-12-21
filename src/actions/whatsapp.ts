"use server";

import { prisma } from "@/lib/db";
import { graphUrl, metaHeaders } from "@/lib/meta-client";
import { env } from "@/lib/env";

/**
 * Sync WhatsApp Accounts (Phone Numbers) from the configured WABA
 */
export async function syncWhatsapp() {
    try {
        const accessToken = env.META_WHATSAPP_ACCESS_TOKEN;
        const wabaId = env.META_WHATSAPP_BUSINESS_ACCOUNT_ID;

        if (!accessToken || !wabaId) {
            console.error("Missing Meta WhatsApp Configuration (Token or WABA ID)");
            return { success: false, error: "Missing configuration" };
        }

        // Fetch Phone Numbers registered to this WABA
        const url = graphUrl(`/${wabaId}/phone_numbers`);
        const response = await fetch(url, {
            headers: metaHeaders(accessToken)
        });

        const data = await response.json();

        if (data.error) {
            console.error("Meta API Error:", data.error);
            return { success: false, error: data.error.message };
        }

        const phoneNumbers = data.data || [];
        let syncedCount = 0;

        for (const phoneComp of phoneNumbers) {
            // phoneComp structure: { id, display_phone_number, verified_name, quality_rating, ... }

            await prisma.whatsappAccount.upsert({
                where: { phoneNumberId: phoneComp.id },
                update: {
                    phoneNumber: phoneComp.display_phone_number,
                    businessName: phoneComp.verified_name || "Imperium Gate",
                    accessToken: accessToken, // Sharing the system token for now
                    status: "active",
                    lastSyncedAt: new Date(),
                },
                create: {
                    userId: "current-user", // TODO: Auth context or Admin System User
                    phoneNumberId: phoneComp.id,
                    phoneNumber: phoneComp.display_phone_number,
                    businessName: phoneComp.verified_name || "Imperium Gate",
                    accessToken: accessToken,
                    status: "active",
                    lastSyncedAt: new Date(),
                }
            });
            syncedCount++;
        }

        return { success: true, count: syncedCount };

    } catch (error) {
        console.error("Failed to sync WhatsApp:", error);
        return { success: false, error: "Failed to sync WhatsApp" };
    }
}
