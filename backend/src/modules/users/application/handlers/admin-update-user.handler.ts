import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { CryptoUtils, UserType, UserStatus } from '../../../../shared';
import { AdminUpdateUserDto } from '../../presentation/dto/admin-update-user.dto';

@Injectable()
export class AdminUpdateUserHandler {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(id: string, dto: AdminUpdateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    let passwordHash = user.passwordHash;
    if (dto.password && dto.password.length >= 6) {
      passwordHash = await CryptoUtils.hashPassword(dto.password);
    }

    const updatedUser = new UserEntity({
      ...user.toJSON(),
      phone: dto.phone !== undefined ? dto.phone : user.phone,
      passwordHash,
      type: (dto.role?.toLowerCase() as UserType) || user.type,
      role: (dto.role?.toLowerCase() as UserType) || user.role,
      status: (dto.status?.toLowerCase() as UserStatus) || user.status,
      profile: {
        ...user.profile,
        firstName: dto.firstName !== undefined ? dto.firstName : user.firstName,
        lastName: dto.lastName !== undefined ? dto.lastName : user.lastName,
      },
      updatedAt: new Date(),
    });

    return this.userRepository.update(updatedUser);
  }
}
