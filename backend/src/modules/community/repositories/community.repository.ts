import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle.service';
import {
  conversationsTable,
  conversationMessagesTable,
  usersTable,
} from '../../../infrastructure/database/schema';
import { CreateConversationDto, PostMessageDto } from '../dto/community.dto';

@Injectable()
export class CommunityRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
    const [conv] = await this.drizzle.db
      .insert(conversationsTable)
      .values({
        customerId: userId,
        channel: dto.channel,
        subject: dto.subject,
        priority: dto.priority,
        status: 'open',
      })
      .returning();

    await this.drizzle.db.insert(conversationMessagesTable).values({
      conversationId: conv.id,
      senderType: 'customer',
      senderId: userId,
      body: dto.initialMessage,
    });

    return this.findById(conv.id);
  }

  async findById(id: number) {
    const [conv] = await this.drizzle.db
      .select({
        id: conversationsTable.id,
        channel: conversationsTable.channel,
        status: conversationsTable.status,
        subject: conversationsTable.subject,
        priority: conversationsTable.priority,
        createdAt: conversationsTable.createdAt,
        updatedAt: conversationsTable.updatedAt,
        customerId: conversationsTable.customerId,
        customerEmail: usersTable.email,
      })
      .from(conversationsTable)
      .leftJoin(usersTable, eq(conversationsTable.customerId, usersTable.id))
      .where(eq(conversationsTable.id, id))
      .limit(1);

    if (!conv) return null;

    const messages = await this.drizzle.db
      .select()
      .from(conversationMessagesTable)
      .where(eq(conversationMessagesTable.conversationId, id))
      .orderBy(conversationMessagesTable.createdAt);

    return {
      ...conv,
      messages,
    };
  }

  async listConversations(status?: string) {
    return this.drizzle.db
      .select()
      .from(conversationsTable)
      .where(status ? eq(conversationsTable.status, status) : undefined)
      .orderBy(desc(conversationsTable.updatedAt));
  }

  async addMessage(conversationId: number, senderId: string, senderType: string, dto: PostMessageDto) {
    const [msg] = await this.drizzle.db
      .insert(conversationMessagesTable)
      .values({
        conversationId,
        senderType,
        senderId,
        body: dto.body,
        isAiGenerated: dto.isAiGenerated ?? false,
      })
      .returning();

    await this.drizzle.db
      .update(conversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(conversationsTable.id, conversationId));

    return msg;
  }
}
