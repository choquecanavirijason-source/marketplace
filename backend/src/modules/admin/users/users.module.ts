import { Module, Global } from '@nestjs/common';

import { UsersController, MeController } from './controllers';
import { UserService } from './services';
import { UserRepository } from './repositories';
import { UserRepositoryPort } from './interfaces/user-repository.interface';

@Global()
@Module({
  controllers: [UsersController, MeController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: UserRepositoryPort,
      useClass: UserRepository,
    },
  ],
  exports: [
    UserService,
    UserRepository,
    UserRepositoryPort,
  ],
})
export class UsersModule {}
