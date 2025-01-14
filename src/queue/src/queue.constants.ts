
import * as dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

export const RABBITMQ_CONFIG = {
      // uri: 'amqp://localhost:5672', // RabbitMQ 的连接地址
      uri: `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PWD}@localhost:5672`, // RabbitMQ 的连接地址
    //   urls: [`amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`],
        
      exchange: 'nest_rabbitmq',   // 交换机名称
      queue: {
          inventoryCheck: 'inventory_check_queue',
          inventoryReduce: 'inventory_reduce_queue',
          inventoryReduceDone: 'inventory_reduce_queue_done',
      },
};
  