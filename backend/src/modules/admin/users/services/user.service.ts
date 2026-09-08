import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { UserRepositoryPort, UserListFilters } from '../interfaces/user-repository.interface';
import { AuthRepositoryPort } from '../interfaces/auth-repository.interface';
import { UserEntity } from '../entities/user.entity';
import { EmailValidator } from '../validators/email.validator';
import { UserStatus, UserType } from '../enums';
import {
  CryptoUtils,
  DuplicateEntityException,
  EntityNotFoundException,
} from '../../../../shared';
import { AdminCreateUserDto, AdminUpdateUserDto, ProfileDto, BusinessProfileDto, CreateAddressDto, UpdateAddressDto } from '../dto';
import { AddressProps } from '../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  async listUsers(filters: UserListFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const { items, total } = await this.userRepository.list(filters);

    return {
      items: items.map((u) => u.toJSON()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundException('Usuario', id);
    }
    return user;
  }

  async createUser(dto: AdminCreateUserDto): Promise<UserEntity> {
    const cleanEmail = EmailValidator.validate(dto.email);
    const existing = await this.userRepository.findByEmail(cleanEmail);
    if (existing) {
      throw new DuplicateEntityException('Usuario', 'email', cleanEmail);
    }

    const passwordHash = await CryptoUtils.hashPassword(dto.password);
    const newUser = new UserEntity({
      id: crypto.randomUUID(),
      email: cleanEmail,
      phone: dto.phone || null,
      passwordHash,
      type: ((dto as any).type || dto.role || UserType.BUYER) as UserType,
      status: (dto.status || UserStatus.ACTIVE) as UserStatus,
      profile: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        language: 'es',
        currency: 'ARS',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.create(newUser);
  }

  async updateUser(id: string, dto: AdminUpdateUserDto): Promise<UserEntity> {
    const user = await this.getUser(id);

    if (dto.firstName || dto.lastName) {
      user.updateProfile({
        firstName: dto.firstName ?? user.firstName,
        lastName: dto.lastName ?? user.lastName,
      });
    }

    if (dto.phone !== undefined) {
      user.changePhone(dto.phone);
    }

    if (dto.role) {
      user.changeType(dto.role as UserType);
    }

    if (dto.status) {
      user.changeStatus(dto.status as UserStatus);
    }

    if (dto.emailVerified !== undefined) {
      if (dto.emailVerified) {
        user.verifyEmail();
      } else {
        user.unverifyEmail();
      }
    }

    if (dto.phoneVerified !== undefined) {
      if (dto.phoneVerified) {
        user.verifyPhone();
      } else {
        user.unverifyPhone();
      }
    }

    if (dto.password) {
      const newHash = await CryptoUtils.hashPassword(dto.password);
      user.changePassword(newHash);
    }

    return this.userRepository.update(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUser(id);
    user.softDelete();
    await this.userRepository.update(user);
    await this.authRepository.revokeAllUserSessions(id);
  }

  async updateStatus(id: string, status: string, reason: string, updatedBy?: string, clientIp?: string) {
    const user = await this.getUser(id);
    user.changeStatus(status as UserStatus);
    await this.userRepository.update(user);

    await this.authRepository.logSecurityEvent(
      id,
      'USER_STATUS_CHANGED',
      'info',
      clientIp,
      undefined,
      { newStatus: status, reason, updatedBy },
    );

    return user.toJSON();
  }

  async updateRoles(id: string, roles: string[]) {
    await this.getUser(id);
    await this.userRepository.assignRoles(id, roles);
    return { success: true, roles };
  }

  async getUserAudit(id: string) {
    const user = await this.getUser(id);
    const events = await this.authRepository.getUserSecurityEvents(id);
    return {
      userId: id,
      userEmail: user.email,
      events,
    };
  }

  async updateProfile(userId: string, dto: ProfileDto): Promise<UserEntity> {
    const user = await this.getUser(userId);
    user.updateProfile({
      firstName: dto.firstName,
      lastName: dto.lastName,
      avatarUrl: dto.avatarUrl,
      birthDate: dto.birthDate,
      language: dto.language,
      currency: dto.currency,
      country: dto.country,
      phoneCountry: dto.phoneCountry,
    });
    const incomingPhone = dto.phone || dto.mobileNumber || dto.mobile_number;
    if (incomingPhone !== undefined) {
      user.changePhone(incomingPhone ? incomingPhone.trim() : null);
    }
    return this.userRepository.update(user);
  }

  async updateBusinessProfile(userId: string, dto: BusinessProfileDto): Promise<UserEntity> {
    const user = await this.getUser(userId);
    user.updateBusinessProfile({
      legalName: dto.legalName,
      tradeName: dto.tradeName,
      taxId: dto.taxId,
      legalType: dto.legalType,
      billingEmail: dto.billingEmail,
      fiscalAddress: dto.fiscalAddress,
    });
    return this.userRepository.update(user);
  }

  async listAddresses(userId: string): Promise<AddressProps[]> {
    const user = await this.getUser(userId);
    return user.addresses ?? [];
  }

  async addAddress(userId: string, dto: CreateAddressDto): Promise<AddressProps> {
    const address: AddressProps = {
      id: '',
      userId,
      label: dto.label || 'Principal',
      country: dto.country,
      province: dto.province,
      city: dto.city,
      street: dto.street,
      number: dto.number,
      zip: dto.zip,
      isDefault: Boolean(dto.isDefault),
    };
    return this.userRepository.saveAddress(userId, address);
  }

  async editAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<AddressProps> {
    const updated = await this.userRepository.updateAddress(userId, addressId, dto);
    if (!updated) {
      throw new EntityNotFoundException('Dirección', addressId);
    }
    return updated;
  }

  async removeAddress(userId: string, addressId: string): Promise<void> {
    const deleted = await this.userRepository.deleteAddress(userId, addressId);
    if (!deleted) {
      throw new EntityNotFoundException('Dirección', addressId);
    }
  }
}
