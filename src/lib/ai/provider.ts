/**
 * AI Provider Abstraction Layer
 * Supports OpenRouter (primary), ZAI (secondary), and Gemini (fallback)
 */
import { env } from '@/lib/env';

export type AIProvider = "openrouter" | "zai" | "gemini";

export interface GenerateTextOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ZAIResponse {
  response: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Get current AI provider from environment
 */
function getCurrentProvider(): AIProvider {
  const provider = env.AI_PROVIDER?.toLowerCase();

  switch (provider) {
    case "openrouter":
      return "openrouter";
    case "zai":
      return "zai";
    case "gemini":
    default:
      return "gemini";
  }
}

/**
 * Generate text using OpenRouter
 */
async function generateWithOpenRouter(
  prompt: string,
  options?: GenerateTextOptions
): Promise<string> {
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const messages = [];

  // Add system message if provided
  if (options?.system) {
    messages.push({
      role: "system",
      content: options.system
    });
  }

  // Add user message
  messages.push({
    role: "user",
    content: prompt
  });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Imperium Gate CRM"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Generate text using ZAI
 */
async function generateWithZAI(
  prompt: string,
  options?: GenerateTextOptions
): Promise<string> {
  const apiKey = env.ZAI_API_KEY;
  const model = env.ZAI_MODEL || "zai-large";

  if (!apiKey) {
    throw new Error("ZAI API key not configured");
  }

  const response = await fetch("https://api.zai.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(options?.system ? [{ role: "system", content: options.system }] : []),
        { role: "user", content: prompt }
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000
    })
  });

  if (!response.ok) {
    throw new Error(`ZAI API error: ${response.statusText}`);
  }

  const data: ZAIResponse = await response.json();
  return data.response || "";
}

/**
 * Generate text using Gemini (fallback)
 */
async function generateWithGemini(
  prompt: string,
  options?: GenerateTextOptions
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
  });

  const fullPrompt = options?.system
    ? `${options.system}\n\n${prompt}`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

/**
 * Main generateText function - routes to appropriate provider
 */
export async function generateText(
  prompt: string,
  options?: GenerateTextOptions
): Promise<string> {
  const provider = getCurrentProvider();

  try {
    switch (provider) {
      case "openrouter":
        return await generateWithOpenRouter(prompt, options);

      case "zai":
        return await generateWithZAI(prompt, options);

      case "gemini":
      default:
        return await generateWithGemini(prompt, options);
    }
  } catch (error) {
    console.error(`AI Provider (${provider}) failed:`, error);

    // Fallback to Gemini if primary provider fails
    if (provider !== "gemini") {
      console.log("Falling back to Gemini...");
      try {
        return await generateWithGemini(prompt, options);
      } catch (fallbackError) {
        console.error("Gemini fallback also failed:", fallbackError);
        throw new Error("All AI providers failed");
      }
    }

    throw error;
  }
}

/**
 * Get current provider configuration status
 */
export function getProviderStatus() {
  const provider = getCurrentProvider();
  const config = {
    provider,
    configured: false,
    hasFallback: true,
    details: {} as Record<string, any>
  };

  switch (provider) {
    case "openrouter":
      config.configured = !!env.OPENROUTER_API_KEY;
      config.details = {
        apiKey: !!env.OPENROUTER_API_KEY,
        model: env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet"
      };
      break;

    case "zai":
      config.configured = !!env.ZAI_API_KEY;
      config.details = {
        apiKey: !!env.ZAI_API_KEY,
        model: env.ZAI_MODEL || "zai-large"
      };
      break;

    case "gemini":
    default:
      config.configured = !!env.GEMINI_API_KEY;
      config.details = {
        apiKey: !!env.GEMINI_API_KEY,
        model: env.GEMINI_MODEL || "gemini-2.0-flash-exp"
      };
      break;
  }

  return config;
}

/**
 * Test provider connectivity
 */
export async function testProvider(provider?: AIProvider): Promise<{
  success: boolean;
  latency?: number;
  error?: string;
}> {
  const testProvider = provider || getCurrentProvider();
  const startTime = Date.now();

  try {
    const testPrompt = "Respond with exactly: OK";
    const response = await generateText(testPrompt);
    const latency = Date.now() - startTime;

    return {
      success: response.includes("OK"),
      latency,
      error: response.includes("OK") ? undefined : "Unexpected response"
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
