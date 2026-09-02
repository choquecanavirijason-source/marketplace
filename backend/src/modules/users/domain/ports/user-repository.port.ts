import { UserEntity, AddressProps } from '../entities/user.entity';
import { UserRole, UserStatus } from '../../../../shared';

export interface UserListFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | string;
  type?: string;
  status?: UserStatus | string;
}

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByPhone(phone: string): Promise<UserEntity | null>;
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract update(user: UserEntity): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
  abstract list(filters?: UserListFilters | number, limit?: number): Promise<{ items: UserEntity[]; total: number }>;
  abstract assignRoles(userId: string, roleCodenames: string[], assignedBy?: string): Promise<void>;
  abstract saveOnboardingStep(userId: string, stepCode: string, status: string): Promise<void>;
  abstract saveAddress(userId: string, address: AddressProps): Promise<AddressProps>;
}
