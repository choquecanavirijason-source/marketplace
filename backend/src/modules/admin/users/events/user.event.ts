export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly userType: string,
    public readonly registeredAt: Date = new Date(),
  ) {}
}

export class UserStatusChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly changedAt: Date = new Date(),
  ) {}
}
