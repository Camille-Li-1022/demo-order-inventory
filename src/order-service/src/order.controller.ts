import { Controller, Get, Query, Post, Body, Injectable } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from "./entities/order.entity"


@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    getHello(): string {
        return this.orderService.getHello();
    }

    @Get('status')
    async getOrderStatus(@Query() query: { user_id: number, order_id: number }): Promise<{ order_id: number, status: string }> {
        return this.orderService.getOrderStatus(query.user_id, query.order_id);
    }
  
    // 根据 user_id 获取用户的所有订单
    @Get('orders')
    async listUserOrders(@Query('user_id') user_id: number) {
        return this.orderService.listUserOrders(user_id);
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


