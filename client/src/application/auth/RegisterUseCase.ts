import type { AuthRepository, RegisterData } from "@/domain/repositories/AuthRepository";
import type { AuthSession } from "@/domain/repositories/AuthRepository";

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(data: RegisterData): Promise<AuthSession> {
    return this.authRepository.register(data);
  }
}