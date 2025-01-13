import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis'

@Injectable()
export class AppService {
    constructor(@InjectRedis() private readonly redis: Redis) {}
    
    getHello(): string {
        return 'Hello World!';
    }

    async setKey(key: string, value: string): Promise<void> {
        await this.redis.set(key, value);
    }

    async getKey(key: string): Promise<string | null> {
        return await this.redis.get(key);
    }

}
