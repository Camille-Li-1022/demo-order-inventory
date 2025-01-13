import { Controller, Get, Post, Body, Injectable } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from "./entities/order.entity"


@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: Order) {
    return this.orderService.createOrder(createOrderDto);
  }
}


