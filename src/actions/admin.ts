"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * 🔐 Gathers all souls currently inhabiting Zeta.
 */
export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            }
        });
        return { success: true, users };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

/**
 * 🎭 Reassigns a user's role in the hierarchy.
 */
export async function updateUserRole(userId: string, role: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        revalidatePath("/[locale]/admin", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to update role:", error);
        return { success: false, error: "Failed to update role" };
    }
}

/**
 * ⚡ Toggles a user's access to the Zeta collective.
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
        revalidatePath("/[locale]/admin", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

/**
 * 💀 Permanently removes a user from existence.
 */
export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/[locale]/admin", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
