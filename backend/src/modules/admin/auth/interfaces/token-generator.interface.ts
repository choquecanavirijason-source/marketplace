export interface TokenPayload {
  sub: string;
  email: string;
  type: string;
  role: string;
  roles: string[];
  permissions: string[];
  kycLevel: number;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export abstract class TokenGeneratorPort {
  abstract generateTokens(payload: TokenPayload): Promise<GeneratedTokens>;
  abstract verifyAccessToken(token: string): Promise<TokenPayload>;
  abstract hashRefreshToken(token: string): Promise<string>;
}
