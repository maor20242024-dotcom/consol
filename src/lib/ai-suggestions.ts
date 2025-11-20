// AI Suggestion Helper - Simulated AI responses
// In future, this will integrate with real AI APIs (OpenRouter, Gemini, etc.)

/**
 * Mock AI suggestions for ad headlines
 * Structure: templates with placeholders that can be customized
 */
const HEADLINE_TEMPLATES = [
    "Limited Time: {product} - {discount}% Off Today!",
    "Discover {product} - Your New Favorite!",
    "{product} That Changed Everything",
    "Say Goodbye to {pain_point} with {product}",
    "Join Thousands Loving {product}",
    "The Only {product} You'll Ever Need",
    "Transform Your Life with {product}",
    "Perfect {product} for Every Budget",
    "Get {product} - Special Offer Inside",
    "Why Everyone Wants {product} Right Now",
];

/**
 * Mock AI suggestions for ad descriptions
 * Structure: templates with placeholders that can be customized
 */
const DESCRIPTION_TEMPLATES = [
    "Introducing {product} - the solution you've been waiting for! Experience premium quality at an unbeatable price. Limited stock available, order now and enjoy free shipping.",
    "Transform your {category} experience today. {product} combines innovation with affordability. Trusted by thousands of happy customers worldwide. Don't miss out!",
    "Looking for the perfect {product}? Our customers rave about its quality and performance. Get {discount}% off your first order today. Fast shipping, money-back guarantee.",
    "Upgrade your lifestyle with {product}. Proven to save you time and money. Join our community of satisfied customers and experience the difference.",
    "What makes {product} special? Superior craftsmanship, attention to detail, and customer-first service. See why it's the #1 choice in {category}.",
];

/**
 * Generate an AI suggestion for a headline
 * @param productName - The name of the product
 * @param discount - Optional discount percentage
 * @returns Suggested headline
 */
export function generateHelineSuggestion(
    productName: string = "Your Product",
    discount: string = "20"
): string {
    if (!productName || productName.trim() === "") {
        productName = "Your Product";
    }

    const template =
        HEADLINE_TEMPLATES[Math.floor(Math.random() * HEADLINE_TEMPLATES.length)];

    return template
        .replace("{product}", productName)
        .replace("{discount}", discount)
        .replace("{pain_point}", "common challenges")
        .slice(0, 125); // Ensure it doesn't exceed the 125 character limit
}

/**
 * Generate an AI suggestion for a description
 * @param productName - The name of the product
 * @param category - Optional product category
 * @param discount - Optional discount percentage
 * @returns Suggested description
 */
export function generateDescriptionSuggestion(
    productName: string = "Your Product",
    category: string = "category",
    discount: string = "20"
): string {
    if (!productName || productName.trim() === "") {
        productName = "Your Product";
    }

    if (!category || category.trim() === "") {
        category = "category";
    }

    const template =
        DESCRIPTION_TEMPLATES[
        Math.floor(Math.random() * DESCRIPTION_TEMPLATES.length)
        ];

    return template
        .replace("{product}", productName)
        .replace("{category}", category)
        .replace("{discount}", discount)
        .replace("{pain_point}", "common challenges")
        .slice(0, 300); // Ensure it doesn't exceed the 300 character limit
}

/**
 * Generate AI tags/keywords from a headline or description
 * @param text - The text to generate tags from
 * @returns Array of suggested tags
 */
export function generateTagsSuggestion(text: string): string[] {
    const words = text
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 4);

    // Get unique words, shuffle, and return top 5
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.slice(0, 5);
}

/**
 * Simulate API delay for more realistic UX
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export async function simulateApiDelay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
