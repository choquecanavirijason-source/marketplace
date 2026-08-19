import type { AuthRepository, LoginCredentials } from "@/domain/repositories/AuthRepository";
import type { AuthSession } from "@/domain/repositories/AuthRepository";

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.authRepository.login(credentials);
  }
}