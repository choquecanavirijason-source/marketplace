import { Injectable } from '@nestjs/common';
import { UserRepositoryPort, UserListFilters } from '../../domain/ports/user-repository.port';

@Injectable()
export class ListUsersQuery {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(filters: UserListFilters) {
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
}
