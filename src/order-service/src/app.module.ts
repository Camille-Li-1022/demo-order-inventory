import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { QueueModule } from '../../queue/src/queue.module';
// import { TypeOrmModule } from "@nestjs/typeorm"
// import { Order } from './entities/order.entity';

@Module({
  imports: [
    QueueModule,
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: 'root',
    //   database: 'nest_demo',
    //   entities: [Order],
    //   autoLoadEntities: true,
    //   synchronize: true, // 仅开发环境使用
    // }),
    // TypeOrmModule.forFeature([Order]) // 注册库存实体
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
