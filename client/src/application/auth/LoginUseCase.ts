import type { AuthRepository, LoginCredentials } from "@/services";
import type { AuthSession } from "@/services";

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.authRepository.login(credentials);
  }
}