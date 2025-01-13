// src/queue/queue.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONFIG } from './queue.constants';
import { QueueService } from './queue.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [{ name: RABBITMQ_CONFIG.exchange, type: 'topic' }],
      uri: RABBITMQ_CONFIG.uri,
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
