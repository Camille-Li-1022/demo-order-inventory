import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { QueueModule } from '../../queue/src/queue.module';
import { TypeOrmModule } from "@nestjs/typeorm"
import { CacheService } from '../../shared/src/cache/cache.service'
import { Order } from './entities/order.entity';
import * as dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

@Module({
  imports: [
        QueueModule,
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD,
            database: process.env.MYSQL_DB,
            entities: [Order],
            autoLoadEntities: true,
            synchronize: true, // 仅开发环境使用
        }),
        TypeOrmModule.forFeature([Order]) // 注册库存实体
    ],
    controllers: [OrderController],
    providers: [OrderService, CacheService],
    exports: [CacheService]
})
export class AppModule {}
