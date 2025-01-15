import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';


@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get()
    getHello(): string {
        return this.inventoryService.getHello();
    }
    // @Get('list')
    // async getAllProducts() {
    //     return await this.inventoryService.getAllProductIds();
    // }
}
