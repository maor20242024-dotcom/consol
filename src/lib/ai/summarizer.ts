import { generateText } from "./provider";

export async function summarizeContent(content: string): Promise<string> {
    try {
        const prompt = `
      You are an expert CRM assistant. Summarize the following interaction content into a concise, professional summary.
      Highlight key points, action items, and any specific requirements mentioned.
      Keep it under 3 sentences.
      
      Content: "${content}"
    `;

        const response = await generateText(prompt);
        return response;
    } catch (error) {
        console.error("Error summarizing content:", error);
        return "Failed to generate summary.";
    }
}

export async function extractActionItems(content: string): Promise<string[]> {
    try {
        const prompt = `
      Extract actionable items or next steps from the following text.
      Return them as a JSON array of strings.
      
      Text: "${content}"
    `;

        const response = await generateText(prompt);
        const text = response;
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error extracting action items:", error);
        return [];
    }
}
