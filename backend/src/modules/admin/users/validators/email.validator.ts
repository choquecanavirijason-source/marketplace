import { DomainException } from '../../../../shared';

export class EmailValidator {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  static isValid(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim().toLowerCase();
    return clean.length <= 255 && this.EMAIL_REGEX.test(clean);
  }

  static validate(email: string): string {
    if (!this.isValid(email)) {
      throw new DomainException(`El correo electrónico '${email}' tiene un formato inválido.`);
    }
    return email.trim().toLowerCase();
  }
}

export const EmailVo = EmailValidator;
