// src/redis/redis-lock.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisLockService {
  constructor(private readonly redis: Redis) {}

  async lock(key: string, ttl: number): Promise<boolean> {
    const result = await this.redis.set(key, 'locked', 'NX');
    // const result = await this.redis.set(key, 'locked', {
    //   NX: true,
    //   PX: ttl
    // });
    return result === 'OK';
  }

  async unlock(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
