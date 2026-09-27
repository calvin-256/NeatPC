import prisma from './db';
import type { QuizAnswers } from './ai/gemini';

export interface CreateChatSessionParams {
  userId?: string;
  quizAnswers: QuizAnswers;
}

export interface AddMessageParams {
  chatSessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  productRefs?: string[];
}

/**
 * Creates a new chat session when a user starts the quiz or requests recommendations.
 */
export async function createChatSession({ userId, quizAnswers }: CreateChatSessionParams) {
  return await prisma.chatSession.create({
    data: {
      userId,
      quizAnswers: JSON.stringify(quizAnswers),
    },
  });
}

/**
 * Retrieves a chat session with all its messages, ordered chronologically.
 */
export async function getChatSession(sessionId: string) {
  return await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

/**
 * Adds a new message to an existing chat session.
 * Optionally links recommended products via productRefs.
 */
export async function addChatMessage({ chatSessionId, role, content, productRefs = [] }: AddMessageParams) {
  return await prisma.chatMessage.create({
    data: {
      chatSessionId,
      role,
      content,
      productRefs: JSON.stringify(productRefs),
    },
  });
}

/**
 * Retrieves recent chat sessions for a specific user.
 */
export async function getUserChatSessions(userId: string, limit = 10) {
  return await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Only get the latest message for preview
      },
    },
  });
}
