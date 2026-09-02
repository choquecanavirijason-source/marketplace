export interface SessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;
  deviceId?: string | null;
  ip?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastSeenAt?: Date;
  revokedAt?: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

export class SessionEntity {
  private props: SessionProps;

  constructor(props: SessionProps) {
    this.props = {
      ...props,
      ip: props.ip ?? props.ipAddress,
      ipAddress: props.ip ?? props.ipAddress,
      lastSeenAt: props.lastSeenAt ?? new Date(),
      revokedAt: props.revokedAt ?? null,
    };
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get refreshTokenHash(): string { return this.props.refreshTokenHash; }
  get deviceId(): string | null | undefined { return this.props.deviceId; }
  get ip(): string | null | undefined { return this.props.ip; }
  get ipAddress(): string | null | undefined { return this.props.ip; }
  get userAgent(): string | null | undefined { return this.props.userAgent; }
  get lastSeenAt(): Date { return this.props.lastSeenAt ?? this.props.createdAt; }
  get revokedAt(): Date | null | undefined { return this.props.revokedAt; }
  get isRevoked(): boolean { return Boolean(this.props.revokedAt); }
  get expiresAt(): Date { return this.props.expiresAt; }
  get createdAt(): Date { return this.props.createdAt; }

  isValid(): boolean {
    return !this.isRevoked && new Date().getTime() < this.props.expiresAt.getTime();
  }

  revoke() {
    this.props.revokedAt = new Date();
  }

  updateLastSeen() {
    this.props.lastSeenAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      deviceId: this.deviceId,
      ip: this.ip,
      userAgent: this.userAgent,
      lastSeenAt: this.lastSeenAt,
      isRevoked: this.isRevoked,
      revokedAt: this.revokedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
    };
  }
}
