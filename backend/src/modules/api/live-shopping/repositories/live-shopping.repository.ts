import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  liveEventsTable,
  liveChatMessagesTable,
  productsTable,
} from '../../../../infrastructure/database/schema';
import { CreateLiveEventDto, PostLiveChatMessageDto } from '../dto/live-shopping.dto';

@Injectable()
export class LiveShoppingRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createLiveEvent(sellerId: string | null, dto: CreateLiveEventDto) {
    const slug = `${dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const [event] = await this.drizzle.db
      .insert(liveEventsTable)
      .values({
        title: dto.title,
        slug,
        description: dto.description,
        sellerId,
        streamUrl: dto.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'scheduled',
        scheduledAt: new Date(dto.scheduledAt),
        pinnedProductId: dto.pinnedProductId,
      })
      .returning();

    return event;
  }

  async listLiveEvents() {
    return this.drizzle.db
      .select()
      .from(liveEventsTable)
      .orderBy(desc(liveEventsTable.scheduledAt));
  }

  async findById(id: number) {
    const [event] = await this.drizzle.db
      .select()
      .from(liveEventsTable)
      .where(eq(liveEventsTable.id, id))
      .limit(1);

    if (!event) return null;

    let pinnedProduct = null;
    if (event.pinnedProductId) {
      [pinnedProduct] = await this.drizzle.db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, event.pinnedProductId))
        .limit(1);
    }

    const messages = await this.drizzle.db
      .select()
      .from(liveChatMessagesTable)
      .where(eq(liveChatMessagesTable.liveEventId, id))
      .orderBy(liveChatMessagesTable.createdAt);

    return {
      ...event,
      pinnedProduct,
      messages,
    };
  }

  async addChatMessage(eventId: number, dto: PostLiveChatMessageDto) {
    const [msg] = await this.drizzle.db
      .insert(liveChatMessagesTable)
      .values({
        liveEventId: eventId,
        userName: dto.userName,
        body: dto.body,
      })
      .returning();
    return msg;
  }

  async updateLiveStatus(eventId: number, status: string) {
    const isStarted = status === 'live';
    const isEnded = status === 'ended';

    const [updated] = await this.drizzle.db
      .update(liveEventsTable)
      .set({
        status,
        updatedAt: new Date(),
        ...(isStarted ? { startedAt: new Date() } : {}),
        ...(isEnded ? { endedAt: new Date() } : {}),
      })
      .where(eq(liveEventsTable.id, eventId))
      .returning();

    return updated;
  }
}
