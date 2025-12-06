import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

/**
 * AI Suggestions API for Campaign Manager
 * Provides AI-powered suggestions for campaign optimization
 */

interface SuggestionRequest {
  campaignName: string;
  description: string;
  objective: string;
}

interface AISuggestions {
  audience: string;
  budget: string;
  schedule: string;
  hashtags: string;
  adCopy: string;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body: SuggestionRequest = await req.json();
    
    const { campaignName, description, objective } = body;
    
    // Generate AI suggestions using the same multi-provider system
    const prompt = `
      As an expert digital marketing specialist, analyze this campaign and provide optimized suggestions:
      
      Campaign Name: ${campaignName}
      Description: ${description}
      Objective: ${objective}
      
      Provide suggestions in JSON format for:
      1. Target audience description
      2. Recommended budget range
      3. Optimal scheduling timing
      4. Relevant hashtags for social media
      5. Compelling ad copy suggestions
      
      Focus on luxury real estate marketing and high-value clients.
    `;
    
    // Try AI providers sequentially
    const providers = [
      {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: {
          model: 'anthropic/claude-3-haiku',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        }
      },
      {
        name: 'ZAI',
        url: process.env.ZAI_API_URL || 'https://api.zai.ai/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: {
          model: 'zai-gpt-4',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        }
      },
      {
        name: 'Gemini',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          contents: [
            { parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        }
      }
    ];
    
    let suggestions: AISuggestions | null = null;
    let lastError: Error | null = null;
    
    for (const provider of providers) {
      try {
        console.log(`Trying ${provider.name} for AI suggestions...`);
        
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: provider.headers as Record<string, string>,
          body: JSON.stringify(provider.body)
        });
        
        if (!response.ok) {
          throw new Error(`${provider.name} API error: ${response.status}`);
        }
        
        const data = await response.json();
        let content: string = '';
        
        if (provider.name === 'Gemini') {
          content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          content = data.choices?.[0]?.message?.content || '';
        }
        
        if (!content) {
          throw new Error('No content returned from AI');
        }
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Validate and format suggestions
          suggestions = {
            audience: parsed.audience || 'High-net-worth individuals interested in luxury real estate',
            budget: parsed.budget || '$5,000 - $15,000 for optimal reach',
            schedule: parsed.schedule || 'Weekday evenings and weekends for highest engagement',
            hashtags: parsed.hashtags || '#LuxuryRealEstate #DubaiProperties #Investment #PremiumLiving',
            adCopy: parsed.adCopy || 'Discover exclusive luxury properties in Dubai\'s most prestigious locations. Schedule your private viewing today.'
          };
          
          console.log(`Successfully generated suggestions using ${provider.name}`);
          break;
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
        
      } catch (error) {
        console.error(`${provider.name} failed for suggestions:`, error);
        lastError = error as Error;
        continue;
      }
    }
    
    if (!suggestions) {
      // Fallback suggestions
      suggestions = {
        audience: 'High-net-worth individuals aged 30-60 interested in luxury real estate investments',
        budget: 'Start with $2,000-5,000, scale based on performance',
        schedule: 'Run during business hours (9 AM-6 PM) for professional audience',
        hashtags: '#LuxuryRealEstate #DubaiProperties #Investment #PremiumLiving #RealEstate',
        adCopy: 'Exclusive luxury properties in Dubai\'s prime locations. Premium amenities and stunning views. Contact us for private viewing.'
      };
      
      if (lastError) {
        console.error('All AI providers failed, using fallback suggestions:', lastError);
      }
    }
    
    return NextResponse.json({
      success: true,
      suggestions,
      provider: suggestions ? 'AI' : 'Fallback'
    });
    
  } catch (error) {
    console.error('POST /api/campaigns-manager/ai-suggestions error:', error);
    
    // Return fallback suggestions even on error
    const fallbackSuggestions: AISuggestions = {
      audience: 'Affluent professionals and investors seeking luxury properties',
      budget: '$3,000-8,000 for initial campaign',
      schedule: 'Tuesday-Thursday, 6-9 PM for optimal engagement',
      hashtags: '#LuxuryRealEstate #Dubai #InvestmentProperty #PremiumLiving',
      adCopy: 'Discover extraordinary luxury properties in Dubai. Exclusive amenities and prime locations. Schedule your consultation today.'
    };
    
    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      provider: 'Fallback',
      error: 'Using fallback suggestions due to AI error'
    });
  }
}
