import { Injectable, Logger } from '@nestjs/common';
import { lt } from 'drizzle-orm';
import { DrizzleService } from '../../infrastructure/database/drizzle.service';
import { sessionsTable } from '../../infrastructure/database/schema/sessions.schema';

@Injectable()
export class CleanSessionsTask {
  private readonly logger = new Logger(CleanSessionsTask.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async cleanExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await this.drizzle.db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expiresAt, now))
      .returning();

    const count = result.length;
    if (count > 0) {
      this.logger.log(`Limpieza completada: ${count} sesiones expiradas eliminadas.`);
    }
    return count;
  }
}
