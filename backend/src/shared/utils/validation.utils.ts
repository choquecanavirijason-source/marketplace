export class ValidationUtils {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

  static isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  static isValidE164Phone(phone: string): boolean {
    return this.E164_PHONE_REGEX.test(phone);
  }
}
