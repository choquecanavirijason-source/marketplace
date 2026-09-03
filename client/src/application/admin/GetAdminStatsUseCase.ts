import type { AdminRepository, AdminStats } from "@/services";

export class GetAdminStatsUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute(): Promise<AdminStats> {
    return this.adminRepository.getStats();
  }
}