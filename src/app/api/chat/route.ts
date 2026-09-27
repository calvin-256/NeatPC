import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getProductRecommendations, QuizAnswers } from '@/lib/ai/gemini';
import { createChatSession, addChatMessage } from '@/lib/chat';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.email ? await getUserIdByEmail(session.user.email) : undefined;
    
    const body = await req.json();
    const { budget, category, primaryUse, preferences } = body as QuizAnswers;

    if (!budget || !category || !primaryUse || !preferences) {
      return NextResponse.json(
        { error: 'Missing required quiz answers (budget, category, primaryUse, preferences)' },
        { status: 400 }
      );
    }

    // 1. Create a chat session in the DB
    const chatSession = await createChatSession({
      userId,
      quizAnswers: { budget, category, primaryUse, preferences },
    });

    // 2. Save the user's "prompt" as the first message
    await addChatMessage({
      chatSessionId: chatSession.id,
      role: 'user',
      content: `I'm looking for a ${category} for ${primaryUse}. My budget is ${budget}. Preferences: ${preferences.join(', ')}.`,
    });

    // 3. Call Gemini to get recommendations
    const recommendations = await getProductRecommendations({ budget, category, primaryUse, preferences });

    // 4. Save Gemini's response as the assistant message, linking recommended products
    await addChatMessage({
      chatSessionId: chatSession.id,
      role: 'assistant',
      content: recommendations.analysis,
      productRefs: recommendations.recommendedProductIds,
    });

    // 5. Return the result back to the frontend
    return NextResponse.json({
      sessionId: chatSession.id,
      analysis: recommendations.analysis,
      recommendedProductIds: recommendations.recommendedProductIds,
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations. Please try again later.' },
      { status: 500 }
    );
  }
}

// Helper to look up the user ID since NextAuth session only has email by default
import prisma from '@/lib/db';
async function getUserIdByEmail(email: string): Promise<string | undefined> {
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id;
}
