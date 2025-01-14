import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }


@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get()
    getHello(): string {
        return this.inventoryService.getHello();
    }
    // @Post('/lock')
    // async lockStock(@Body() lockStockDto: LockStockDto) {
    //   return this.inventoryService.lockStock(lockStockDto);
    // }

    // @Post('/reduce')
    // async reduceStock(@Body() reduceStockDto: ReduceStockDto) {
    //   return this.inventoryService.reduceStock(reduceStockDto);
    // }
}
