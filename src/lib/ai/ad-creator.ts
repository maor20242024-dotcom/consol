import { generateText } from "./provider";
import { crmService } from "@/lib/integrations/crm";

export async function generateAdCopy(topic: string, tone: string = "Professional", platform: string = "Instagram"): Promise<{
    headline: string;
    primaryText: string;
    hashtags: string[];
}> {
    try {
        // Enriched context from CRM (Integration Ready)
        let additionalContext = "";
        if (crmService.isConfigured) {
            // Future: specific context injection logic here
        }

        const prompt = `
      You are an expert copywriter for luxury real estate ads on ${platform}.
      Create a high-converting ad for the following topic: "${topic}".
      Tone: ${tone}.
      ${additionalContext}
      
      Return as result strictly as a JSON object with the following keys:
      - "headline": A catchy headline (max 50 chars).
      - "primaryText": The main ad body (max 200 chars).
      - "hashtags": An array of 5 relevant hashtags.
      
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

        const response = await generateText(prompt);
        const text = response.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating ad copy:", error);
        return {
            headline: "Error Generating Ad",
            primaryText: "Failed to generate ad copy. Please try again.",
            hashtags: []
        };
    }
}

export async function analyzeAdPerformance(metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
}): Promise<string> {
    try {
        const ctr = (metrics.clicks / metrics.impressions) * 100;
        const cpc = metrics.spend / metrics.clicks;
        const cpl = metrics.leads > 0 ? metrics.spend / metrics.leads : 0;

        const prompt = `
      Analyze the following ad performance metrics:
      - Spend: $${metrics.spend}
      - Impressions: ${metrics.impressions}
      - Clicks: ${metrics.clicks}
      - Leads: ${metrics.leads}
      - CTR: ${ctr.toFixed(2)}%
      - CPC: $${cpc.toFixed(2)}
      - CPL: $${cpl.toFixed(2)}
      
      Provide a concise (2-3 sentences) analysis of the performance and one actionable recommendation to improve ROI.
      Focus on whether the ad is expensive, effective, or needs targeting adjustment.
    `;

        const response = await generateText(prompt);
        return response;
    } catch (error) {
        console.error("Error analyzing ad performance:", error);
        return "Failed to analyze performance.";
    }
}


/**
 * Simulate API delay for better UX
 */
export async function simulateApiDelay(ms = 800) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate headline suggestions using AI Provider
 */
export async function generateHeadlineSuggestion(
    topic: string,
    count: number = 3
): Promise<string[]> {
    try {
        const prompt = `You are a luxury real estate copywriter.
Write ${count} catchy, short (max 10 words) headlines for: "${topic}".
Focus on luxury, exclusivity, and impact.
Return ONLY the headlines, one per line. No numbering.`;

        const response = await generateText(prompt);

        return response
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.match(/^\d+[\.\)]/))
            .slice(0, count);

    } catch (error) {
        console.error('Error generating headlines:', error);
        return [
            `${topic} - Exclusive Imperial Offer`,
            `Experience Luxury in ${topic}`,
            `Discover ${topic} with Royal Style`
        ];
    }
}

/**
 * Generate description suggestions using AI Provider
 */
export async function generateDescriptionSuggestion(
    topic: string,
    headline?: string,
    count: number = 2
): Promise<string[]> {
    try {
        const prompt = `You are a luxury real estate copywriter.
Write ${count} compelling descriptions (50-80 words) for: "${topic}"
${headline ? `Headline: "${headline}"` : ''}
Tone: Imperial, Exclusive, Persuasive.
Include a Call to Action.
Return ONLY the descriptions, separated by double newlines. No numbering.`;

        const response = await generateText(prompt);

        return response
            .split('\n\n')
            .map(para => para.trim().replace(/^\d+[\.\)]\s*/, ''))
            .filter(para => para.length > 20)
            .slice(0, count);

    } catch (error) {
        console.error('Error generating descriptions:', error);
        return [
            `Discover ${topic} with IMPERIUM GATE. Where luxury meets exclusivity. Book your appointment now for an experience befitting your stature.`,
            `${topic} - More than just real estate, it's a royal lifestyle. Let our experts guide you to a world of elegance. Contact us today.`
        ];
    }
}
