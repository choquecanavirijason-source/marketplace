import { DomainException } from '../../../../shared';
import { UserStatus } from '../enums/user-status.enum';

export class UserValidator {
  static validateStatusTransition(currentStatus: UserStatus, targetStatus: UserStatus): void {
    if (currentStatus === UserStatus.LOGICALLY_DELETED) {
      throw new DomainException('No se puede cambiar el estado de un usuario eliminado lógicamente.');
    }
  }
}
