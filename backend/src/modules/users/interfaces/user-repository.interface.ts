import { UserEntity } from '../entities/user.entity';

export interface UserListFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByPhone(phone: string): Promise<UserEntity | null>;
  abstract findByTaxId(taxId: string): Promise<UserEntity | null>;
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract update(user: UserEntity): Promise<UserEntity>;
  abstract list(filters: UserListFilters): Promise<{ items: UserEntity[]; total: number }>;
  abstract assignRoles(userId: string, roleCodenames: string[]): Promise<void>;
  abstract saveOnboardingStep(userId: string, stepCode: string, status: string): Promise<void>;
}
