import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { redisConfig } from '../../config';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queues: Map<string, Queue> = new Map();

  onModuleInit() {
    this.logger.log('Inicializando servicio de colas BullMQ...');
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: {
          url: redisConfig.url,
          maxRetriesPerRequest: null,
        },
        defaultJobOptions: {
          attempts: 4,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: false, // Keep in DLQ for audit
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  async addJob<T>(queueName: string, jobName: string, data: T): Promise<void> {
    try {
      const queue = this.getQueue(queueName);
      await queue.add(jobName, data);
      this.logger.log(`Job [${jobName}] agregado a la cola [${queueName}]`);
    } catch (err) {
      this.logger.warn(`Error agregando job a la cola [${queueName}]: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.log(`Cola [${name}] cerrada.`);
    }
  }
}
