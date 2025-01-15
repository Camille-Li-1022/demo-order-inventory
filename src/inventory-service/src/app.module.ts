import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { QueueModule } from '../../queue/src/queue.module'
import { TypeOrmModule } from "@nestjs/typeorm"
import { Inventory } from './entities/inventory.entity';
import { RedisLockModule } from '../../shared/src/redis/redis-lock.module';
import { RedisModule } from '../../shared/src/redis/redis.module';
import { CacheService } from '../../shared/src/cache/cache.service'
import { RedisService } from '../../shared/src/redis/redis.service'
import * as dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

@Module({
  imports: [
        QueueModule,
        RedisModule,
        RedisLockModule,
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD,
            database: process.env.MYSQL_DB,
            entities: [Inventory],
            autoLoadEntities: true,
            synchronize: true, // 仅开发环境使用
        }),
        TypeOrmModule.forFeature([Inventory]) // 注册库存实体
    ],
    controllers: [InventoryController],
    providers: [InventoryService, CacheService, RedisService],
    exports: [CacheService, RedisService]
})
export class AppModule {}

