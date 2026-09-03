import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { RegisterUserCommand } from '../commands/register-user.command';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { UserEntity, BusinessProfileProps } from '../../domain/entities/user.entity';
import { EmailVo } from '../../domain/value-objects/email.vo';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { CryptoUtils, DuplicateEntityException, UserStatus, UserType, OnboardingStep } from '../../../../shared';

@Injectable()
export class RegisterUserHandler {
  private readonly logger = new Logger(RegisterUserHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserEntity> {
    const emailVo = new EmailVo(command.email);
    const existing = await this.userRepository.findByEmail(emailVo.getValue());

    if (existing) {
      throw new DuplicateEntityException('Usuario', 'email', emailVo.getValue());
    }

    if (command.phone) {
      const existingPhone = await this.userRepository.findByPhone(command.phone);
      if (existingPhone) {
        throw new DuplicateEntityException('Usuario', 'teléfono', command.phone);
      }
    }

    const passwordHash = await CryptoUtils.hashPassword(command.password);
    const userType = command.type || command.role || UserType.BUYER;

    let businessProfile: BusinessProfileProps | null = null;
    if (
      userType === UserType.SELLER_INDIVIDUAL ||
      userType === UserType.SELLER_EMPRESA ||
      userType === UserType.SELLER ||
      command.taxId
    ) {
      businessProfile = {
        legalName: command.legalName || `${command.firstName} ${command.lastName}`.trim(),
        tradeName: command.tradeName || null,
        taxId: command.taxId || 'PENDIENTE',
        legalType: command.legalType || (userType === UserType.SELLER_EMPRESA ? 'EMPRESA' : 'INDIVIDUAL'),
        billingEmail: emailVo.getValue(),
        fiscalAddress: command.fiscalAddress || null,
        reviewStatus: 'pending',
      };
    }

    const newUser = new UserEntity({
      id: crypto.randomUUID(),
      email: emailVo.getValue(),
      phone: command.phone || null,
      passwordHash,
      status: UserStatus.ACTIVE,
      type: userType as UserType,
      role: userType as UserType,
      profile: {
        firstName: command.firstName,
        lastName: command.lastName,
        language: 'es',
        currency: 'USD',
        completionPct: 20,
      },
      businessProfile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.userRepository.create(newUser);

    await this.userRepository.saveOnboardingStep(saved.id, OnboardingStep.BASE_REGISTRATION, 'completed');
    if (command.termsAccepted) {
      await this.userRepository.saveOnboardingStep(saved.id, OnboardingStep.TERMS_ACCEPTED, 'completed');
    }

    await this.authRepository.logSecurityEvent(
      saved.id,
      'USER_REGISTERED',
      'info',
      command.ip,
      undefined,
      {
        email: saved.email,
        type: saved.type,
        termsAccepted: command.termsAccepted,
        userAgent: command.userAgent,
      },
    );

    this.logger.log(`Usuario registrado exitosamente: ${saved.id} (${saved.email})`);

    this.eventEmitter.emit(
      UserRegisteredEvent.EVENT_NAME,
      new UserRegisteredEvent(saved),
    );

    return saved;
  }
}
