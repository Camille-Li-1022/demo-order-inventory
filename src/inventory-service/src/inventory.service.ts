import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { RedisLockService } from "../../shared/src/redis/redis-lock.service"
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { QueueService } from '../../queue/src/queue.service';
import { CacheService } from '../../shared/src/cache/cache.service'
import { MoreThan } from 'typeorm'; 
import { RedisService } from '../../shared/src/redis/redis.service'


@Injectable()
export class InventoryService {
    // private inventory = { productId1: 100, productId2: 200 }; // 模拟库存
    constructor(
        @InjectRepository(Inventory) private readonly inventoryRepo: Repository<Inventory>,
        private readonly redisLockService: RedisLockService,
        private readonly queueService: QueueService,
        private readonly cacheService: CacheService,
        private readonly redisService: RedisService, // 注入 Redis
    ) {}
    
    getHello(): string {
        return 'Hello Inventory Service!';
    }
    
    async onModuleInit() {  // init
        let product_ids = []
        const all_products = await this.inventoryRepo.find({
            where: {
              stock: MoreThan(0),  // stock > 0
            },
        });
        all_products.forEach(info => {
            const { product_id } = info;
            product_ids.push(product_id)
        })
        await this.redisService.set(`available_product_ids`, JSON.stringify(product_ids), 24*60*60); // 24 h

        console.log('Loaded and cached available product IDs:', product_ids);
    }
    async getAllProductIds(): Promise<[]> {
        const cachedProductIds = await this.redisService.getKey('available_product_ids');
        if (cachedProductIds) {
            return JSON.parse(cachedProductIds);
        } else {
            return []
        }
    }

    @RabbitSubscribe({
        exchange: 'nest_rabbitmq',
        routingKey: 'inventory_reduce_queue',
        queue: 'inventory_reduce_queue',
    })
    async reduceInventory(msg: { order_id: number; product_id: string; quantity: number }) { //: Promise<void> {
        const { order_id, product_id, quantity } = msg;
        console.log(`<Inventory-Service> get mq message: inventory_reduce_queue`, msg)
        if (!this.cacheService.has(product_id)) {
            this.cacheService.set(product_id, true, 5*60)   // 5 min cache
        }
        if (!this.cacheService.get(product_id)) {
            console.log(`<Inventory-Service> reject(Insufficient stock) send mq message: inventory_reduce_queue_done`, { order_id, status: `REJECT` })
            await this.queueService.publishMessage('inventory_reduce_queue_done', { order_id, status: `REJECT`, error_code: 2 });
            console.error('Insufficient stock.')
            return
        }

        // redis lock
        const lockKey = `lock:inventory:${product_id}`;
        const lockAcquired = await this.redisLockService.lock(lockKey, 5000); // 5秒锁
    
        console.log("Inventory to reduce, get redist lock: ", { lockAcquired })
        if (!lockAcquired) {
            console.log(`<Inventory-Service> reject(redis-lock) send mq message: inventory_reduce_queue_done`, { order_id, status: `REJECT` })
            await this.queueService.publishMessage('inventory_reduce_queue_done', { order_id, status: `REJECT`, error_code: 1 });
            // throw new ConflictException('Unable to acquire lock for inventory.');
            console.error('Unable to acquire lock for inventory.')
            return
        }
        
        try {
            const inventory = await this.inventoryRepo.findOne({ where: { product_id } });
            console.log("=========== debug in Inventory-Service, get inventory by product_id: ", { inventory, product_id })
            if (!inventory || inventory.stock < quantity) {
                console.log(`<Inventory-Service> reject(Insufficient stock) send mq message: inventory_reduce_queue_done`, { order_id, status: `REJECT` })
                await this.queueService.publishMessage('inventory_reduce_queue_done', { order_id, status: `REJECT`, error_code: 2 });
                console.error('Insufficient stock.')
                this.cacheService.set(product_id, false, 5*60)   // 5 min cache
                return;
                // throw new ConflictException('Insufficient stock.');
            }
      
            inventory.stock -= quantity;
            await this.inventoryRepo.save(inventory);
            
            console.log(`<Inventory-Service> send mq message: inventory_reduce_queue_done`, { order_id, status: `CONFIRM` })
            // 发送消息到库存服务
            await this.queueService.publishMessage('inventory_reduce_queue_done', { order_id, status: `CONFIRM` });

        } finally {
            await this.redisLockService.unlock(lockKey);
        }
    }

    @RabbitSubscribe({
        exchange: 'nest_rabbitmq',
        routingKey: 'inventory_add_queue',
        queue: 'inventory_add_queue',
    })
    async addInventory(msg: { order_id: number, product_id: string; quantity: number }) {
        const { order_id, product_id, quantity } = msg;
        try {
            const inventory = await this.inventoryRepo.findOne({ where: { product_id } });
            if (!inventory) {
                throw new ConflictException('Inventory not found.');
            }
      
            inventory.stock += quantity;
            await this.inventoryRepo.save(inventory);
            console.log(`<Inventory-Service>: inventory_add_queue`, msg)

            console.log(`<Inventory-Service> send mq message: inventory_add_queue_done`, { product_id })
            // 发送消息到库存服务
            await this.queueService.publishMessage('inventory_add_queue_done', { product_id });

            this.cacheService.set(product_id, true, 5*60)   // 5 min cache
        } catch(error) {
            console.error(`addInventory catch error: `, error)
        }

    }

}
