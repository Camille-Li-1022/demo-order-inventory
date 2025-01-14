import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.INVENTORY_SERVICE_PORT ?? 3000
  await app.listen(port);
  console.log(`Inventory Service listen at: ${port}`)
}
bootstrap();
