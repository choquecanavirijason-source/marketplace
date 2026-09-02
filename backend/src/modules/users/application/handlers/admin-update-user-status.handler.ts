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

    // Apply state change on domain entity
    switch (normalizedStatus) {
      case UserStatus.ACTIVA:
        user.activate();
        break;
      case UserStatus.SUSPENDIDA:
        user.suspend();
        break;
      case UserStatus.RESTRINGIDA:
        user.restrict();
        break;
      case UserStatus.EN_REVISION:
        user.sendToReview();
        break;
      case UserStatus.RECHAZADA:
        user.reject();
        break;
      case UserStatus.ELIMINADA_LOGICAMENTE:
        user.softDelete();
        break;
      default:
        (user as any).props.status = normalizedStatus;
        break;
    }

    const updated = await this.userRepository.update(user);

    // If account was suspended, restricted, rejected or soft-deleted, invalidate all active sessions
    if (
      normalizedStatus === UserStatus.SUSPENDIDA ||
      normalizedStatus === UserStatus.RECHAZADA ||
      normalizedStatus === UserStatus.ELIMINADA_LOGICAMENTE
    ) {
      await this.authRepository.revokeAllUserSessions(userId);
      await this.cacheService.delPattern(`session:${userId}:*`);
    }

    // Log security audit event
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
