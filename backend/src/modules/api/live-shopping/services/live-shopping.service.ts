import { Injectable, NotFoundException } from '@nestjs/common';
import { LiveShoppingRepository } from '../repositories/live-shopping.repository';
import { CreateLiveEventDto, PostLiveChatMessageDto } from '../dto/live-shopping.dto';

@Injectable()
export class LiveShoppingService {
  constructor(private readonly liveRepo: LiveShoppingRepository) {}

  async createEvent(sellerId: string | null, dto: CreateLiveEventDto) {
    return this.liveRepo.createLiveEvent(sellerId, dto);
  }

  async listEvents() {
    return this.liveRepo.listLiveEvents();
  }

  async getEventRoom(id: number) {
    const event = await this.liveRepo.findById(id);
    if (!event) {
      throw new NotFoundException(`Evento en vivo #${id} no encontrado.`);
    }
    return event;
  }

  async postMessage(eventId: number, dto: PostLiveChatMessageDto) {
    await this.getEventRoom(eventId);
    return this.liveRepo.addChatMessage(eventId, dto);
  }

  async updateStatus(eventId: number, status: string) {
    await this.getEventRoom(eventId);
    return this.liveRepo.updateLiveStatus(eventId, status);
  }
}
