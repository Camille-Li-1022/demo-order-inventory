import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { QueueModule } from '../../queue/src/queue.module';
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
  imports: [
    QueueModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'demo',
      autoLoadEntities: true,
      synchronize: true, // 仅开发环境使用
    })
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
