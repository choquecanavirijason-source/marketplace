import { UserRole, UserType } from '../../../../shared';

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone?: string,
    public readonly type: UserType = UserType.BUYER,
    public readonly role?: UserRole,
    // Seller specific data
    public readonly legalName?: string,
    public readonly tradeName?: string,
    public readonly taxId?: string,
    public readonly legalType?: string,
    public readonly fiscalAddress?: string,
    // Client context
    public readonly termsAccepted: boolean = true,
    public readonly ip?: string,
    public readonly userAgent?: string,
  ) {}
}
