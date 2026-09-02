import { EmailVo } from './email.vo';
import { DomainException } from '../../../../shared';

describe('EmailVo', () => {
  it('should normalize and create a valid email', () => {
    const email = new EmailVo('  USER@Example.COM ');
    expect(email.getValue()).toBe('user@example.com');
  });

  it('should throw DomainException for invalid email format', () => {
    expect(() => new EmailVo('not-an-email')).toThrow(DomainException);
    expect(() => new EmailVo('')).toThrow(DomainException);
  });
});
