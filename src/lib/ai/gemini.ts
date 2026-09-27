import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import prisma from '../db';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export interface QuizAnswers {
  budget: string;
  category: string;
  primaryUse: string;
  preferences: string[];
}

export interface RecommendationResponse {
  analysis: string;
  recommendedProductIds: string[];
}

/**
 * Get product recommendations from Gemini based on user quiz answers
 */
export async function getProductRecommendations(
  answers: QuizAnswers,
  limit: number = 5
): Promise<RecommendationResponse> {
  if (!config.gemini.isConfigured) {
    throw new Error('Gemini API key is not configured.');
  }

  // 1. Fetch available products from the database to give context to the AI
  const availableProducts = await prisma.product.findMany({
    where: { category: answers.category },
    select: {
      id: true,
      name: true,
      brand: true,
      bestPrice: true,
      dealScore: true,
      specsJson: true,
    },
    take: 50, // Limit the number of products sent to the prompt
    orderBy: { dealScore: 'desc' },
  });

  if (availableProducts.length === 0) {
    return { analysis: "We couldn't find any products matching that category right now.", recommendedProductIds: [] };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  // 2. Build the prompt
  const prompt = `
You are an expert PC and electronics deal finder. A user has provided their requirements.
Based on the available products below, recommend up to ${limit} products that best fit their needs.
Analyze why these products are good choices.

User Requirements:
- Budget: ${answers.budget}
- Category: ${answers.category}
- Primary Use: ${answers.primaryUse}
- Preferences: ${answers.preferences.join(', ')}

Available Products (JSON):
${JSON.stringify(availableProducts, null, 2)}

Return your response STRICTLY as a JSON object with this exact structure (no markdown formatting, just raw JSON):
{
  "analysis": "Your detailed reasoning here...",
  "recommendedProductIds": ["id1", "id2"]
}
  `.trim();

  // 3. Call Gemini
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // 4. Parse the JSON response
  try {
    // Strip markdown code blocks if the AI returns them
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(cleanedText) as RecommendationResponse;
    return parsed;
  } catch (error) {
    console.error('Failed to parse Gemini response:', responseText);
    throw new Error('Invalid response format from AI');
  }
}
