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
}


