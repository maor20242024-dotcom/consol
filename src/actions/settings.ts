"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/api-auth";

/**
 * 🛠️ Settings Controller for Zeta Core.
 * Bypasses stale typed client with raw SQL for Zeta-level persistence.
 */

export async function getSettingsData() {
    try {
        const authUser = await requireAuth();
        if (!authUser) throw new Error("Unauthorized");

        // Bypassing stale typed client with raw SQL
        const users: any[] = await prisma.$queryRaw`SELECT id, email, name, role, settings FROM "User" WHERE id = ${authUser.id} LIMIT 1`;
        const user = users[0];

        if (!user) throw new Error("User not found in Zeta DB");

        let systemSettings = null;
        if (user.role === "admin" || user.role === "superadmin") {
            const settingsList: any[] = await prisma.$queryRaw`SELECT key, value FROM "SystemSetting"`;
            systemSettings = settingsList.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
        }

        return {
            success: true,
            user,
            systemSettings
        };
    } catch (error: any) {
        console.error("[SETTINGS_FETCH_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch settings" };
    }
}

export async function updateUserSettings(data: any) {
    try {
        const authUser = await requireAuth();
        if (!authUser) throw new Error("Unauthorized");

        const settingsJson = JSON.stringify(data);
        await prisma.$executeRaw`UPDATE "User" SET settings = ${settingsJson}::jsonb WHERE id = ${authUser.id}`;

        revalidatePath("/[locale]/settings", "page");
        return { success: true };
    } catch (error: any) {
        console.error("[USER_SETTINGS_UPDATE_ERROR]", error);
        return { success: false, error: error.message || "Failed to update user settings" };
    }
}

export async function updateSystemSettings(key: string, value: any) {
    try {
        const authUser = await requireAuth();
        if (!authUser) throw new Error("Unauthorized");

        if (authUser.role !== "admin" && authUser.role !== "superadmin") {
            throw new Error("Forbidden: Alpha access required");
        }

        const valueJson = JSON.stringify(value);
        const id = `global_${key}`;

        // Raw Upsert for SystemSetting
        await prisma.$executeRaw`
            INSERT INTO "SystemSetting" (id, key, value, "updatedAt")
            VALUES (${id}, ${key}, ${valueJson}::jsonb, NOW())
            ON CONFLICT (key) DO UPDATE SET value = ${valueJson}::jsonb, "updatedAt" = NOW()
        `;

        revalidatePath("/[locale]/settings", "page");
        revalidatePath("/[locale]/admin", "page");
        return { success: true };
    } catch (error: any) {
        console.error("[SYSTEM_SETTINGS_UPDATE_ERROR]", error);
        return { success: false, error: error.message || "Failed to update system configuration" };
    }
}
