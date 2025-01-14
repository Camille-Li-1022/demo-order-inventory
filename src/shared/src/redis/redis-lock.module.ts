// redis-lock.module.ts
import { Module } from '@nestjs/common';
import { RedisLockService } from './redis-lock.service';

@Module({
    providers: [RedisLockService],
    exports: [RedisLockService], // 确保 RedisLockService 被导出
})
export class RedisLockModule {}
