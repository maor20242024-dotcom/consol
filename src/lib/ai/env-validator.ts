import { env } from '@/lib/env';

interface ValidationResult {
  valid: boolean;
  provider: string;
  errors: string[];
  warnings: string[];
  configured: {
    openrouter: boolean;
    zai: boolean;
    gemini: boolean;
  };
}

/**
 * Validate AI environment variables
 */
export function validateAIEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    provider: env.AI_PROVIDER || "gemini",
    errors: [],
    warnings: [],
    configured: {
      openrouter: !!env.OPENROUTER_API_KEY,
      zai: !!env.ZAI_API_KEY,
      gemini: !!env.GEMINI_API_KEY
    }
  };

  const provider = result.provider.toLowerCase();

  // Validate primary provider
  switch (provider) {
    case "openrouter":
      if (!env.OPENROUTER_API_KEY) {
        result.errors.push("OPENROUTER_API_KEY is required for OpenRouter provider");
        result.valid = false;
      }
      if (!env.OPENROUTER_MODEL) {
        result.warnings.push("OPENROUTER_MODEL not set, using default: anthropic/claude-3.5-sonnet");
      }
      break;

    case "zai":
      if (!env.ZAI_API_KEY) {
        result.errors.push("ZAI_API_KEY is required for ZAI provider");
        result.valid = false;
      }
      if (!env.ZAI_MODEL) {
        result.warnings.push("ZAI_MODEL not set, using default: zai-large");
      }
      break;

    case "gemini":
    default:
      if (!env.GEMINI_API_KEY) {
        result.errors.push("GEMINI_API_KEY is required for Gemini provider");
        result.valid = false;
      }
      if (!env.GEMINI_MODEL) {
        result.warnings.push("GEMINI_MODEL not set, using default: gemini-2.0-flash-exp");
      }
      break;
  }

  // Check for fallback availability
  if (!env.GEMINI_API_KEY && provider !== "gemini") {
    result.warnings.push("No GEMINI_API_KEY configured - no fallback available");
  }

  // Log validation results
  if (result.errors.length > 0) {
    console.error("❌ AI Environment Validation Errors:", result.errors);
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️ AI Environment Validation Warnings:", result.warnings);
  }

  if (result.valid && result.errors.length === 0) {
    console.log(`✅ AI Provider "${result.provider}" configured successfully`);
  }

  return result;
}

/**
 * Get environment summary for display
 */
export function getEnvironmentSummary() {
  const validation = validateAIEnvironment();

  return {
    currentProvider: validation.provider,
    isConfigured: validation.valid,
    availableProviders: Object.keys(validation.configured).filter(key =>
      validation.configured[key as keyof typeof validation.configured]
    ),
    issues: {
      errors: validation.errors,
      warnings: validation.warnings
    },
    fallbackAvailable: validation.configured.gemini,
    recommendations: getRecommendations(validation)
  };
}

/**
 * Get configuration recommendations
 */
function getRecommendations(validation: ValidationResult): string[] {
  const recommendations: string[] = [];

  if (!validation.configured.gemini) {
    recommendations.push("Configure GEMINI_API_KEY for fallback reliability");
  }

  if (!validation.configured.openrouter && validation.provider !== "openrouter") {
    recommendations.push("Consider OpenRouter for access to multiple models");
  }

  if (validation.warnings.length > 0) {
    recommendations.push("Address configuration warnings for optimal performance");
  }

  if (validation.errors.length === 0 && validation.configured.gemini) {
    recommendations.push("System fully configured - AI ready for use");
  }

  return recommendations;
}
