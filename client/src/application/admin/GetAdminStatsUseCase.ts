import type { AdminRepository, AdminStats } from "@/domain/repositories/AdminRepository";

export class GetAdminStatsUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute(): Promise<AdminStats> {
    return this.adminRepository.getStats();
  }
}