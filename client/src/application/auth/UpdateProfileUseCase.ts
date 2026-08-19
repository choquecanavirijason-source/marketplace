import type { AuthRepository, UpdateProfileData } from "@/domain/repositories/AuthRepository";
import type { AuthSession } from "@/domain/repositories/AuthRepository";

export class UpdateProfileUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(data: UpdateProfileData): Promise<AuthSession> {
    return this.authRepository.updateProfile(data);
  }
}