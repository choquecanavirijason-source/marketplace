import { describe, it, expect } from 'vitest';
import { EmailValidator } from '../../validators/email.validator';
import { DomainException } from '../../../../../shared';

describe('EmailValidator', () => {
  it('should normalize and validate a valid email', () => {
    const email = EmailValidator.validate('  USER@Example.COM ');
    expect(email).toBe('user@example.com');
  });

  it('should throw DomainException for invalid email format', () => {
    expect(() => EmailValidator.validate('not-an-email')).toThrow(DomainException);
    expect(() => EmailValidator.validate('')).toThrow(DomainException);
  });
});
