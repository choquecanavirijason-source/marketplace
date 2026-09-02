import { Injectable } from '@nestjs/common';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';

@Injectable()
export class ListSessionsQuery {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(userId: string) {
    const sessions = await this.authRepository.findUserSessions(userId);
    return sessions.map((s) => s.toJSON());
  }
}
