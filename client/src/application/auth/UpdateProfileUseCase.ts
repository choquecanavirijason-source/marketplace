import type { AuthRepository, UpdateProfileData } from "@/services";
import type { AuthSession } from "@/services";

export class UpdateProfileUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(data: UpdateProfileData): Promise<AuthSession> {
    return this.authRepository.updateProfile(data);
  }
}