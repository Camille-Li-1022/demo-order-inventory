// import { Injectable } from '@nestjs/common'
// import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

// @Injectable()
// export class QueueService {
//   constructor(private readonly queue: AmqpConnection) {}

//   async checkInventory(productId: string, quantity: number): Promise<boolean> {
//     return this.queue.request({ routingKey: 'inventory.check', payload: { productId, quantity } });
//   }

//   async reduceStock(productId: string, quantity: number) {
//     await this.queue.publish('inventory.reduce', { productId, quantity });
//   }
// }


// src/queue/queue.service.ts
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONFIG } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishMessage(queueName: string, message: any) {
    await this.amqpConnection.publish(RABBITMQ_CONFIG.exchange, queueName, message);
  }
}
