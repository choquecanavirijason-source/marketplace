import { Injectable, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { CryptoUtils, UserType, UserStatus } from '../../../../shared';
import { AdminCreateUserDto } from '../../presentation/dto/admin-create-user.dto';

@Injectable()
export class AdminCreateUserHandler {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(dto: AdminCreateUserDto): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Ya existe un usuario con el correo: ${dto.email}`);
    }

    const passwordHash = await CryptoUtils.hashPassword(dto.password);

    const user = new UserEntity({
      id: crypto.randomUUID(),
      email: dto.email,
      phone: dto.phone ?? null,
      passwordHash,
      type: (dto.role?.toLowerCase() as UserType) || UserType.BUYER,
      role: (dto.role?.toLowerCase() as UserType) || UserType.BUYER,
      status: (dto.status?.toLowerCase() as UserStatus) || UserStatus.ACTIVA,
      profile: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        language: 'es',
        currency: 'USD',
        completionPct: 40,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.create(user);
  }
}
