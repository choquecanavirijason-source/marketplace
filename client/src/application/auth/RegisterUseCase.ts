import type { AuthRepository, RegisterData } from "@/services";
import type { AuthSession } from "@/services";

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(data: RegisterData): Promise<AuthSession> {
    return this.authRepository.register(data);
  }
}