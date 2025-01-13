// // src/redis/redis.module.ts
// import { Module } from '@nestjs/common';
// import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
// import { RedisService } from './redis/redis.service';

// @Module({
//   imports: [
//     NestRedisModule.forRoot({
//       config: {
//         host: 'localhost',
//         port: 6379,
//       },
//     }),
//   ],
//   exports: [NestRedisModule],
//   providers: [RedisService],
// })
// export class RedisModule {}

// // src/redis/redis.module.ts
// import { Module } from '@nestjs/common';
// import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
// import { RedisService } from './redis.service';

// @Module({
//   imports: [
//     NestRedisModule.forRoot({
//       options: {
//         host: 'localhost',
//         port: 6379,
//       },
//     }),
//   ],
//   providers: [RedisService],
//   exports: [NestRedisModule, RedisService],
// })
// export class RedisModule {}

// src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    NestRedisModule.forRoot({
      type: 'single', // 使用单节点模式
      options: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
