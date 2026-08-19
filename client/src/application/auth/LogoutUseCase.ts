import type { AuthRepository } from "@/domain/repositories/AuthRepository";

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}