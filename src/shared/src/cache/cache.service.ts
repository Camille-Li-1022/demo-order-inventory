import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache'

@Injectable()
export class CacheService {
    private cache: NodeCache;

    constructor() {
        this.cache = new NodeCache({ stdTTL: 60 })  // default 1 min
    }
    set(key: string, value: any, ttl: number = 60): boolean {
        return this.cache.set(key, value, ttl);
    }

    get(key: string): any {
        return this.cache.get(key);
    }

    del(key: string): any {
        return this.cache.del(key);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    keys(): string[] {
        return this.cache.keys();
    }
}
