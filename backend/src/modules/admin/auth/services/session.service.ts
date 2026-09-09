import { Injectable } from '@nestjs/common';
import { AuthRepositoryPort } from '../interfaces/auth-repository.interface';

@Injectable()
export class SessionService {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async listSessions(userId: string) {
    const sessions = await this.authRepository.findActiveSessionsByUserId(userId);
    return sessions.map((s) => s.toJSON());
  }

  async revokeSession(sessionId: string, _userId?: string): Promise<void> {
    await this.authRepository.revokeSessionById(sessionId);
  }
}
