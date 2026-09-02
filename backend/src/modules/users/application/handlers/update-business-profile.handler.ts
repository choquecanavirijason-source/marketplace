import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { NotFoundException } from '../../../../shared';

export interface UpdateBusinessProfileInput {
  legalName?: string;
  tradeName?: string;
  taxId?: string;
  legalType?: string;
  billingEmail?: string;
  fiscalAddress?: string;
}

@Injectable()
export class UpdateBusinessProfileHandler {
  private readonly logger = new Logger(UpdateBusinessProfileHandler.name);

  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string, input: UpdateBusinessProfileInput): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario', userId);
    }

    user.updateBusinessProfile({
      legalName: input.legalName,
      tradeName: input.tradeName,
      taxId: input.taxId,
      legalType: input.legalType,
      billingEmail: input.billingEmail,
      fiscalAddress: input.fiscalAddress,
    });

    const saved = await this.userRepository.update(user);
    this.logger.log(`Perfil comercial actualizado para el usuario vendedor: ${userId}`);
    return saved;
  }
}
