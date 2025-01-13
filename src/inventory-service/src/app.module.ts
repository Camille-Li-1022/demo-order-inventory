import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { QueueModule } from '../../queue/src/queue.module'
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
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class AppModule {}
