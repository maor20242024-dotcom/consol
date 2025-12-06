import { prisma } from "@/lib/db";
import { env } from '@/lib/env';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface HealthStatus {
    service: string;
    status: "operational" | "degraded" | "down";
    latency?: number;
    message?: string;
}

export async function checkDatabase(): Promise<HealthStatus> {
    const start = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        return {
            service: "Database (NeonDB)",
            status: "operational",
            latency: Date.now() - start,
        };
    } catch (error: any) {
        return {
            service: "Database (NeonDB)",
            status: "down",
            message: error.message,
        };
    }
}

export async function checkGemini(): Promise<HealthStatus> {
    const start = Date.now();
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        return { service: "AI (Gemini)", status: "down", message: "API Key missing" };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model.generateContent("ping");
        return {
            service: "AI (Gemini)",
            status: "operational",
            latency: Date.now() - start,
        };
    } catch (error: any) {
        return {
            service: "AI (Gemini)",
            status: "degraded",
            message: error.message,
        };
    }
}

export async function checkFacebook(): Promise<HealthStatus> {
    const accessToken = env.META_WHATSAPP_ACCESS_TOKEN; // Using WA token as proxy for FB Graph API access
    if (!accessToken) {
        return { service: "Facebook Graph API", status: "down", message: "Access Token missing" };
    }
    // Simple check logic here, maybe just verify token format or make a lightweight call if possible
    return { service: "Facebook Graph API", status: "operational", message: "Token present (Validation pending)" };
}

export async function checkZadarma(): Promise<HealthStatus> {
    const start = Date.now();
    const apiKey = env.ZADARMA_API_KEY;
    const apiSecret = env.ZADARMA_API_SECRET;

    if (!apiKey || !apiSecret) {
        return { service: "Zadarma (VoIP)", status: "down", message: "API credentials missing" };
    }

    try {
        // Try to get balance as a lightweight check
        const { ZadarmaClient } = await import("@/lib/zadarma");
        const response = await ZadarmaClient.getBalance();

        return {
            service: "Zadarma (VoIP)",
            status: "operational",
            latency: Date.now() - start,
            message: `Balance: ${response.balance} ${response.currency}`
        };
    } catch (error: any) {
        return {
            service: "Zadarma (VoIP)",
            status: "degraded",
            message: error.message,
        };
    }
}

export async function runFullHealthCheck() {
    const results = await Promise.all([
        checkDatabase(),
        checkGemini(),
        checkFacebook(),
        checkZadarma(),
    ]);
    return results;
}
