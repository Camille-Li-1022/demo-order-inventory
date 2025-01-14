import { Controller, Get, Post, Body, Injectable } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from "./entities/order.entity"


@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    getHello(): string {
        return this.orderService.getHello();
    }

    @Post('create')
    async createOrder(@Body() createOrderDto: Order) {
        return this.orderService.createOrder(createOrderDto);
    }

    @Post('complete')
    async completeOrder(@Body() body: { user_id: number, order_id: number }) : Promise<string> {
        return this.orderService.completeOrder(body.user_id, body.order_id);
    }

    // TODO: order expire time, to cancel auto
    @Post('cancel')
    async cancelOrder(@Body() body: { user_id: number, order_id: number }) : Promise<string> {
        return this.orderService.cancelOrder(body.user_id, body.order_id);
    }
}


