import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { RedisLockService } from "../../shared/src/redis/redis-lock.service"
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { QueueService } from '../../queue/src/queue.service';


@Injectable()
export class InventoryService {
    // private inventory = { productId1: 100, productId2: 200 }; // 模拟库存
    constructor(
        @InjectRepository(Inventory) private readonly inventoryRepo: Repository<Inventory>,
        private readonly redisLockService: RedisLockService,
        private readonly queueService: QueueService,
    ) {}

    // @RabbitSubscribe({
    //   exchange: 'order_exchange',
    //   routingKey: 'inventory_check_queue',
    //   queue: 'inventory_check_queue',
    // })
    // async checkInventory(msg: { productId: string; quantity: number }) {
    //   const { productId, quantity } = msg;
    //   if (this.inventory[productId] && this.inventory[productId] >= quantity) {
    //     console.log(`Inventory available for product ${productId}`);
    //     // 可以添加进一步的逻辑，比如锁定库存
    //   } else {
    //     console.error(`Insufficient inventory for product ${productId}`);
    //   }
    // }

    @RabbitSubscribe({
        exchange: 'order_exchange',
        routingKey: 'inventory_reduce_queue',
        queue: 'inventory_reduce_queue',
    })
    async reduceInventory(msg: { order_id: number; product_id: string; quantity: number }) { //: Promise<void> {
      const { order_id, product_id, quantity } = msg;
      const lockKey = `lock:inventory:${product_id}`;
      const lockAcquired = await this.redisLockService.lock(lockKey, 5000); // 5秒锁
  
      if (!lockAcquired) {
        // 发送消息到库存服务
        await this.queueService.publishMessage('inventory_reduce_queue_done', { order_id, status: `REJECT` });
        console.error('Unable to acquire lock for inventory.')
        // throw new ConflictException('Unable to acquire lock for inventory.');
      }
  
      try {
        const inventory = await this.inventoryRepo.findOne({ where: { product_id } });
        if (!inventory || inventory.stock < quantity) {
          // 发送消息到库存服务
          await this.queueService.publishMessage('inventory_reduce_queue_done', { order_id, status: `REJECT` });
          console.error('Insufficient stock.')
          // throw new ConflictException('Insufficient stock.');
        }
  
        inventory.stock -= quantity;
        await this.inventoryRepo.save(inventory);
        
        // 发送消息到库存服务
        await this.queueService.publishMessage('inventory_reduce_queue_done', { order_id, status: `CONFIRM` });

      } finally {
        await this.redisLockService.unlock(lockKey);
      }
    }
}