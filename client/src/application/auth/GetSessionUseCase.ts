import type { AuthRepository } from "@/services";
import type { AuthSession } from "@/services";

export class GetSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<AuthSession> {
    return this.authRepository.me();
  }
}