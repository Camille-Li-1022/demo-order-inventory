import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './shared/src/redis/redis.module';
import { TypeOrmModule } from "@nestjs/typeorm"
import { QueueModule } from './queue/src/queue.module';
import { Inventory } from './inventory-service/src/entities/inventory.entity';
import { RedisLockModule } from './shared/src/redis/redis-lock.module';

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
    //   // entities: ['dist/**/*.entity{.ts,.js}'],
    //   autoLoadEntities: true,
    //   synchronize: true, // 仅开发环境使用
    // }),
    // TypeOrmModule.forFeature([Inventory]) // 注册库存实体
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
