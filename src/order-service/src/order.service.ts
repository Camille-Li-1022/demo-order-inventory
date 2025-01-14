import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { QueueService } from '../../queue/src/queue.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import * as moment from 'moment';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        private readonly queueService: QueueService,
    ) {}
    
    getHello(): string {
        return 'Hello Order Service!';
    }

    async createOrder(dto: Order): Promise<Order> {
        const { user_id, product_id, quantity } = dto;
        const order = this.orderRepo.create({ user_id, product_id, quantity, status: 'PENDING' });
        const savedOrder = await this.orderRepo.save(order);
        const order_id = savedOrder.id;
        console.log("=========== debug in Order-Service, savedOrder: ", savedOrder)
    
        console.log(`<Order-Service> send mq message: inventory_reduce_queue`, { product_id, quantity, order_id }, { user_id })
        // 发送消息到库存服务
        await this.queueService.publishMessage('inventory_reduce_queue', { product_id, quantity, order_id });
    
        return order;
    }

    @RabbitSubscribe({
        exchange: 'nest_rabbitmq',
        routingKey: 'inventory_reduce_queue_done',
        queue: 'inventory_reduce_queue_done',
    })
    async updateOrder(msg: { order_id: number, status: string }) {
        const { order_id, status } = msg;
        console.log(`<Order-Service> get mq message: inventory_reduce_queue_done`, msg)
        try {
            const order = await this.orderRepo.findOne({ where: { id: order_id } });
            if (!order || order.status != 'PENDING') {
                throw new ConflictException('Insufficient stock.');
            }

            order.status = status
            await this.orderRepo.save(order);
        } catch(error) {
            console.error(`Update:: order not found: `, error)
        }
    }

    async completeOrder(user_id:number, order_id: number): Promise<string> {
        try {
            const order = await this.orderRepo.findOne({ where: { id: order_id } });
            if (!order || order.status != 'CONFIRM' || order.user_id != user_id) {
                console.debug('Order not found: ', { order, user_id, order_id })
                throw new ConflictException(`Order not found`);
            }

            order.status = 'COMPLETE'
            await this.orderRepo.save(order);
        } catch(error) {
            console.error(`COMPLETE:: order not found: `, error)
            return 'error'
        }
        return 'ok'
    }
    async cancelOrder(user_id:number, order_id: number): Promise<string> {
        try {
            const order = await this.orderRepo.findOne({ where: { id: order_id } });
            if (!order || order.status != 'CONFIRM' || order.user_id != user_id) {
                throw new ConflictException(`Order not found`);
            }
            const validStatus = [ 'CONFIRM', "COMPLETE" ]
            if (!validStatus.includes(order.status)) {
                throw new ConflictException(`Order status error`);
            }

            order.status = 'CANCEL'
            await this.orderRepo.save(order);
    
            const { product_id, quantity } = order;
            console.log(`<Order-Service> send mq message: inventory_add_queue`, { product_id, quantity, order_id }, { user_id })
            // 发送消息到库存服务
            await this.queueService.publishMessage('inventory_add_queue', { product_id, quantity, order_id });
        } catch(error) {
            console.error(`CANCEL:: order not found: `, error)
            return 'error'
        }
        return 'ok'
    }
}
