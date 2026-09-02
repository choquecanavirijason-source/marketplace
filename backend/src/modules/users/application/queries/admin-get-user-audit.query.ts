import { Injectable } from '@nestjs/common';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { NotFoundException } from '../../../../shared';

@Injectable()
export class AdminGetUserAuditQuery {
  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string, limit = 50) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario', userId);
    }

    const events = await this.authRepository.getUserSecurityEvents(userId, limit);
    return {
      userId,
      userEmail: user.email,
      events,
    };
  }
}
