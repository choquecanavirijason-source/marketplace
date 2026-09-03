import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { NotFoundException, OnboardingStep } from '../../../../shared';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  birthDate?: string;
  language?: string;
  currency?: string;
  phone?: string;
}

@Injectable()
export class UpdateProfileHandler {
  private readonly logger = new Logger(UpdateProfileHandler.name);

  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario', userId);
    }

    if (input.phone !== undefined && input.phone !== user.phone) {
      const existingPhone = await this.userRepository.findByPhone(input.phone);
      if (existingPhone && existingPhone.id !== userId) {
        throw new Error('El número de teléfono ya está registrado por otra cuenta.');
      }
    }

    user.updateProfile({
      firstName: input.firstName,
      lastName: input.lastName,
      avatarUrl: input.avatarUrl,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      language: input.language,
      currency: input.currency,
    });

    if (input.phone !== undefined) {
      const currentJson = user.toJSON();
      const updated = new (user.constructor as any)({
        ...currentJson,
        phone: input.phone,
      });
      return this.userRepository.update(updated);
    }

    const saved = await this.userRepository.update(user);

    if (saved.firstName && saved.lastName) {
      await this.userRepository.saveOnboardingStep(userId, OnboardingStep.PROFILE_COMPLETED, 'completed');
    }

    this.logger.log(`Perfil actualizado para usuario: ${userId}`);
    return saved;
  }
}
