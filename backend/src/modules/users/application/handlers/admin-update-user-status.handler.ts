import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { UserStatus, NotFoundException, BadRequestException } from '../../../../shared';

@Injectable()
export class AdminUpdateUserStatusHandler {
  private readonly logger = new Logger(AdminUpdateUserStatusHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    userId: string,
    newStatus: string,
    reason: string,
    adminUserId?: string,
    ip?: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario', userId);
    }

    const validStatuses = Object.values(UserStatus);
    const normalizedStatus = newStatus.toLowerCase() as UserStatus;
    if (!validStatuses.includes(normalizedStatus)) {
      throw new BadRequestException(`Estado inválido. Opciones válidas: ${validStatuses.join(', ')}`);
    }

    const previousStatus = user.status;

    switch (normalizedStatus) {
      case UserStatus.ACTIVE:
        user.activate();
        break;
      case UserStatus.SUSPENDED:
        user.suspend();
        break;
      case UserStatus.RESTRICTED:
        user.restrict();
        break;
      case UserStatus.IN_REVIEW:
        user.sendToReview();
        break;
      case UserStatus.REJECTED:
        user.reject();
        break;
      case UserStatus.LOGICALLY_DELETED:
        user.softDelete();
        break;
      default:
        (user as any).props.status = normalizedStatus;
        break;
    }

    const updated = await this.userRepository.update(user);

    if (
      normalizedStatus === UserStatus.SUSPENDED ||
      normalizedStatus === UserStatus.REJECTED ||
      normalizedStatus === UserStatus.LOGICALLY_DELETED
    ) {
      await this.authRepository.revokeAllUserSessions(userId);
      await this.cacheService.delPattern(`session:${userId}:*`);
    }

    await this.authRepository.logSecurityEvent(
      userId,
      'ADMIN_STATUS_CHANGED',
      'warning',
      ip,
      undefined,
      {
        previousStatus,
        newStatus: normalizedStatus,
        reason,
        adminUserId,
      },
    );

    this.logger.log(
      `Estado de usuario ${userId} actualizado de ${previousStatus} a ${normalizedStatus} por admin ${adminUserId}. Razón: ${reason}`,
    );

    return updated.toJSON();
  }
}
