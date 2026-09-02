import { Module } from '@nestjs/common';
import { CleanSessionsTask } from './tasks/clean-sessions.task';

@Module({
  providers: [CleanSessionsTask],
  exports: [CleanSessionsTask],
})
export class ScheduledTasksModule {}
