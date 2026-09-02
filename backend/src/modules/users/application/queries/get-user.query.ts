import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { EntityNotFoundException } from '../../../../shared';

@Injectable()
export class GetUserQuery {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundException('Usuario', id);
    }
    return user;
  }
}
