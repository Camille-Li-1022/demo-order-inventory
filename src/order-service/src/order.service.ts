import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { QueueService } from '../../queue/src/queue.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

// @Injectable()
// export class OrderService {
//   constructor(
//     private readonly queueService: QueueService,
//     @InjectRepository(Order) private orderRepository: Repository<Order>,
//   ) {}

//   async createOrder(dto: CreateOrderDto) {
//     // 检查库存（调用库存服务）
//     const inventoryAvailable = await this.queueService.checkInventory(dto.productId, dto.quantity);
//     if (!inventoryAvailable) throw new BadRequestException('Insufficient stock');

//     // 创建订单
//     const order = this.orderRepository.create({ ...dto, status: 'PENDING' });
//     await this.orderRepository.save(order);

//     // 发送扣减库存消息到队列
//     this.queueService.reduceStock(dto.productId, dto.quantity);

//     return { orderId: order.id, message: 'Order placed successfully' };
//   }
// }


// @Injectable()
// export class OrderService {
//   constructor(private readonly queueService: QueueService) {}

//   async createOrder(productId: string, quantity: number) {
//     // 发送库存检查消息
//     await this.queueService.publishMessage('inventory_check_queue', { productId, quantity });

//     // 模拟直接返回，实际会通过消费者返回检查结果
//     return { message: 'Order created and inventory check requested.' };
//   }
// }

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly queueService: QueueService,
  ) {}

  async createOrder(dto: Order): Promise<Order> {
  // async createOrder(user_id: number, product_id: string, quantity: number): Promise<Order> {
    const { user_id, product_id, quantity } = dto;
    const order = this.orderRepo.create({ user_id, product_id, quantity, status: 'PENDING' });
    const savedOrder = await this.orderRepo.save(order);
    const order_id = savedOrder.id;

    // 发送消息到库存服务
    await this.queueService.publishMessage('inventory_reduce_queue', { product_id, quantity, order_id });

    return order;
  }

  @RabbitSubscribe({
      exchange: 'order_exchange',
      routingKey: 'inventory_reduce_queue_done',
      queue: 'inventory_reduce_queue_done',
  })
  async updateOrder(msg: { order_id: number, status: string }) {
    const { order_id, status } = msg;
    try {
      const order = await this.orderRepo.findOne({ where: { id: order_id } });
      if (!order || order.status != 'PENDING') {
        throw new ConflictException('Insufficient stock.');
      }

      order.status = status
      await this.orderRepo.save(order);
    } catch(error) {
      console.error(`updateOrder catch error: `, error)
    }
  }
}
