import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis'

@Injectable()
export class RedisService {
    constructor(@InjectRedis() private readonly redis: Redis) {}
    
    getHello(): string {
        return 'Hello World!';
    }

    async setKey(key: string, value: string): Promise<void> {
        await this.redis.set(key, value);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.redis.set(key, value, 'EX', ttl);
    }

    async getKey(key: string): Promise<string | null> {
        return await this.redis.get(key);
    }

}
