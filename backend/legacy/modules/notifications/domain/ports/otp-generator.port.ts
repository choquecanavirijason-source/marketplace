export abstract class OtpGeneratorPort {
  abstract generateOtp(length?: number): string;
  abstract storeOtp(identifier: string, otp: string, ttlSeconds?: number): Promise<void>;
  abstract verifyOtp(identifier: string, otp: string): Promise<boolean>;
}
