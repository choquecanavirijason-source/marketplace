import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { AuthSession } from "@/domain/repositories/AuthRepository";

export class GetSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<AuthSession> {
    return this.authRepository.me();
  }
}