import type { AuthRepository } from "@/services";

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}