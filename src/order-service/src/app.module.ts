import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { QueueModule } from '../../queue/src/queue.module';
import { TypeOrmModule } from "@nestjs/typeorm"
import { CacheService } from '../../shared/src/cache/cache.service'
import { Order } from './entities/order.entity';
import * as dotenv from 'dotenv';
import { RedisService } from '../../shared/src/redis/redis.service'
import { RedisModule } from '../../shared/src/redis/redis.module';  // 导入 RedisModule


// 加载 .env 文件中的环境变量
dotenv.config();

@Module({
  imports: [
        QueueModule,
        RedisModule,
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
    providers: [OrderService, CacheService, RedisService],
    exports: [CacheService, RedisService]
})
export class AppModule {}
