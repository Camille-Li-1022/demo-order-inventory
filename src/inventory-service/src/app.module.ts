import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { QueueModule } from '../../queue/src/queue.module'
// import { TypeOrmModule } from "@nestjs/typeorm"
import { Inventory } from './entities/inventory.entity';
import { RedisLockModule } from '../../shared/src/redis/redis-lock.module';
import { RedisModule } from '../../shared/src/redis/redis.module';

@Module({
  imports: [
    QueueModule,
    RedisModule,
    RedisLockModule
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: 'root',
    //   database: 'nest_demo',
    //   entities: [Inventory],
    //   autoLoadEntities: true,
    //   synchronize: true, // 仅开发环境使用
    // }),
    // TypeOrmModule.forFeature([Inventory]) // 注册库存实体
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class AppModule {}

