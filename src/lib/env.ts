// src/lib/env.ts
import 'dotenv/config';

export const env = {
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    // Gemini
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    // Zadarma
    ZADARMA_API_KEY: process.env.ZADARMA_API_KEY,
    ZADARMA_API_SECRET: process.env.ZADARMA_API_SECRET,
    ZADARMA_API_URL: process.env.ZADARMA_API_URL,
    // Meta
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    NEXT_PUBLIC_META_REDIRECT_URI: process.env.NEXT_PUBLIC_META_REDIRECT_URI,
    META_WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID,
    META_WHATSAPP_ACCESS_TOKEN: process.env.META_WHATSAPP_ACCESS_TOKEN,
    META_WEBHOOK_VERIFY_TOKEN: process.env.META_WEBHOOK_VERIFY_TOKEN,
    META_USER_ACCESS_TOKEN: process.env.META_USER_ACCESS_TOKEN,
    // Misc
    ACCESS_TOKEN_ENCRYPTION_KEY: process.env.ACCESS_TOKEN_ENCRYPTION_KEY,
    FACEBOOK_AD_ACCOUNT_ID: process.env.FACEBOOK_AD_ACCOUNT_ID,
    NODE_ENV: process.env.NODE_ENV,
    // Additional variables used in AI provider and other modules
    AI_PROVIDER: process.env.AI_PROVIDER,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    ZAI_API_KEY: process.env.ZAI_API_KEY,
    ZAI_MODEL: process.env.ZAI_MODEL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    ZAI_CODING_API_BASE_URL: process.env.ZAI_CODING_API_BASE_URL,
    // Google Sheets Integration
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
};
