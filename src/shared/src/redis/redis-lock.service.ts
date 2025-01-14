import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisLockService {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    async lock(key: string, ttl: number): Promise<boolean> {
        // const result = await this.redis.set(key, `locked`, 'NX', 'EX', ttl);
        // return result === 'OK';
        
        const lockKey = `locked`
        const result = await this.redis.set(key, lockKey, 'NX');
        if (result === 'OK') {
            await this.redis.expire(lockKey, ttl);
            return true
        }
        return false
    }

    async unlock(key: string): Promise<void> {
        await this.redis.del(key);
    }
}
