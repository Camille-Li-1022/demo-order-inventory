import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory-service/src/entities/inventory.entity';
import { QueueService } from './queue/src/queue.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RedisLockService } from "./shared/src/redis/redis-lock.service"


@Injectable()
export class AppService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly queueService: QueueService,
        private readonly redisLockService: RedisLockService,
        // @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
    ) {}
    
    getHello(): string {
        return 'Hello Nest svr!';
    }

    async setKey(key: string, value: string): Promise<void> {
        await this.redis.set(key, value);
    }

    async getKey(key: string): Promise<string | null> {
        return await this.redis.get(key);
    }

    // // 查找所有库存
    // async findAll(): Promise<Inventory[]> {
    //     return await this.inventoryRepository.find();
    // }
    async sendMqMsg(): Promise<string> {
        await this.queueService.publishMessage('inventory_reduce_queue', { product_id: '1001', quantity: 1, order_id: 'test_order1' });
        return 'ok'
    }

    @RabbitSubscribe({
        exchange: 'nest_rabbitmq',
        routingKey: 'inventory_reduce_queue',
        queue: 'inventory_reduce_queue',
    })
    async getMqReduceMsg(msg: { product_id: string, quantity: number, order_id: string }) {
    //   const { product_id, quantity, order_id } = msg;
      console.log("================== debug get mq reduce msg: ", msg)
    }
}
