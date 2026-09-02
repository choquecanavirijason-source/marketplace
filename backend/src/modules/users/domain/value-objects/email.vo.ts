import { DomainException, ValidationUtils } from '../../../../shared';

export class EmailVo {
  private readonly value: string;

  constructor(email: string) {
    const trimmed = email?.trim().toLowerCase();
    if (!trimmed || !ValidationUtils.isValidEmail(trimmed)) {
      throw new DomainException(`El correo '${email}' no tiene un formato válido.`);
    }
    this.value = trimmed;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EmailVo): boolean {
    return this.value === other.value;
  }
}
