import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Inventory } from './inventory-service/src/entities/inventory.entity';


@Controller('inventory')
export class AppController {
    constructor(
        private readonly appService: AppService,
    ) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    // redis
    @Get('set')
    async setKey(): Promise<string> {
        await this.appService.setKey('test', 'hello world');
        return 'success'
    }
    @Get('get')
    async getKey(): Promise<string> {
        return this.appService.getKey('test')
    }

    // mysql
    @Get('all_products')
    async findAll(): Promise<Inventory[]> {
        return await this.appService.findAll();
    }

    // redis
    @Get('mq_send')
    async sendMqMsg(): Promise<string> {
        return this.appService.sendMqMsg()
    }
}

