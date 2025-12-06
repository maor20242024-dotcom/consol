"use server";

import { generateAdCopy, analyzeAdPerformance } from "@/lib/ai/ad-creator";

export async function generateAd(topic: string, tone: string, platform: string) {
    try {
        const result = await generateAdCopy(topic, tone, platform);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: "Failed to generate ad" };
    }
}

export async function analyzeAd(metrics: any) {
    try {
        const analysis = await analyzeAdPerformance(metrics);
        return { success: true, analysis };
    } catch (error) {
        return { success: false, error: "Failed to analyze ad" };
    }
}
