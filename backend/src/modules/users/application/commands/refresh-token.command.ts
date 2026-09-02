export class RefreshTokenCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly correlationId?: string,
  ) {}
}
