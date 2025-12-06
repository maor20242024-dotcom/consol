"use server";

import { summarizeContent, extractActionItems } from "@/lib/ai/summarizer";

export async function generateSummary(content: string) {
    try {
        const summary = await summarizeContent(content);
        return { success: true, summary };
    } catch (error) {
        return { success: false, error: "Failed to generate summary" };
    }
}

export async function getActionItems(content: string) {
    try {
        const items = await extractActionItems(content);
        return { success: true, items };
    } catch (error) {
        return { success: false, error: "Failed to extract action items" };
    }
}
