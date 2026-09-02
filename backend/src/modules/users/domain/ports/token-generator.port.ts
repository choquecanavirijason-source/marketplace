export interface TokenPayload {
  sub: string;
  email: string;
  type?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  kycLevel?: number;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export abstract class TokenGeneratorPort {
  abstract generateAccessToken(payload: TokenPayload): Promise<string>;
  abstract generateRefreshToken(): { token: string; hash: string; expiresAt: Date };
  abstract verifyRefreshToken(token: string): Promise<TokenPayload | null>;
}
