import { UserEntity } from '../entities/user.entity';

export class UserRegisteredEvent {
  static readonly EVENT_NAME = 'user.registered';

  constructor(
    public readonly user: UserEntity,
    public readonly timestamp: Date = new Date(),
  ) {}
}
