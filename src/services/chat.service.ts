import { Response } from 'express';
import { nanoid } from 'nanoid';
import { streamText, generateText } from 'ai';
import { prisma } from '../config/database';
import { env } from '../config/environment';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface CreateSessionInput {
  title?: string;
  model?: string;
}

export class ChatService {
  async getSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, model: true, createdAt: true, updatedAt: true },
    });
  }

  async createSession(userId: string, input: CreateSessionInput) {
    return prisma.chatSession.create({
      data: {
        id: nanoid(),
        userId,
        title: input.title ?? 'New Chat',
        model: input.model ?? env.ai.model,
        status: 'active',
      },
    });
  }

  async getSession(sessionId: string, userId: string) {
    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundError('Chat session');
    if (session.userId !== userId) throw new ForbiddenError();
    return session;
  }

  async deleteSession(sessionId: string, userId: string) {
    const session = await this.getSession(sessionId, userId);
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { status: 'archived' },
    });
  }

  async getMessages(sessionId: string, userId: string) {
    await this.getSession(sessionId, userId);
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(sessionId: string, userId: string, content: string) {
    const session = await this.getSession(sessionId, userId);

    // Persist user message
    await prisma.chatMessage.create({
      data: { id: nanoid(), sessionId, userId, role: 'user', content },
    });

    // Fetch history for context
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const result = await generateText({
      model: session.model,
      system: this.buildSystemPrompt(),
      messages,
    });

    // Persist assistant reply
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        id: nanoid(),
        sessionId,
        userId,
        role: 'assistant',
        content: result.text,
        metadata: {
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          totalTokens: result.usage.totalTokens,
        },
      },
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    logger.info('Chat message processed', { sessionId, totalTokens: result.usage?.totalTokens });
    return assistantMessage;
  }

  async streamMessage(sessionId: string, userId: string, content: string, res: Response) {
    const session = await this.getSession(sessionId, userId);

    await prisma.chatMessage.create({
      data: { id: nanoid(), sessionId, userId, role: 'user', content },
    });

    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const result = streamText({
      model: session.model,
      system: this.buildSystemPrompt(),
      messages,
    });

    let fullText = '';

    for await (const chunk of result.textStream) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    const finalUsage = await result.usage;

    // Persist the full assistant response
    await prisma.chatMessage.create({
      data: {
        id: nanoid(),
        sessionId,
        userId,
        role: 'assistant',
        content: fullText,
        metadata: {
          inputTokens: finalUsage.inputTokens,
          outputTokens: finalUsage.outputTokens,
          totalTokens: finalUsage.totalTokens,
        },
      },
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    res.write('data: [DONE]\n\n');
    res.end();
  }

  private buildSystemPrompt(): string {
    return `You are BLOOM, a neuroaffirming AI assistant designed to support neurodivergent users.

Guidelines:
- Use clear, direct, and kind language
- Avoid idioms, sarcasm, or ambiguous phrases
- Break complex information into smaller, digestible steps
- Be patient and non-judgmental
- Celebrate effort and progress, not just outcomes
- Offer choices rather than directives when possible
- Respect sensory sensitivities — avoid unnecessary urgency or alarming language
- If the user seems overwhelmed, offer to slow down or simplify`;
  }
}
