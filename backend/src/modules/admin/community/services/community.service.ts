import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from '../repositories/community.repository';
import { CreateConversationDto, PostMessageDto } from '../dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepo: CommunityRepository) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
    return this.communityRepo.createConversation(userId, dto);
  }

  async listConversations(status?: string) {
    return this.communityRepo.listConversations(status);
  }

  async getConversation(id: number) {
    const conv = await this.communityRepo.findById(id);
    if (!conv) {
      throw new NotFoundException(`Conversación #${id} no encontrada.`);
    }
    return conv;
  }

  async replyMessage(conversationId: number, senderId: string, senderType: string, dto: PostMessageDto) {
    await this.getConversation(conversationId);
    return this.communityRepo.addMessage(conversationId, senderId, senderType, dto);
  }
}
