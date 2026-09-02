export class StartVerificationCommand {
  constructor(
    public readonly userId: string,
    public readonly targetLevel = 1,
  ) {}
}
