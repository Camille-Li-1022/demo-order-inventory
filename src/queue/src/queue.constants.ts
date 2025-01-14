
const { RABBITMQ_USER, RABBITMQ_PWD } = process.env;
console.log({ RABBITMQ_USER, RABBITMQ_PWD })

export const RABBITMQ_CONFIG = {
      uri: 'amqp://localhost:5672', // RabbitMQ 的连接地址
    //   uri: 'amqp://admin:admin@localhost:5672', // RabbitMQ 的连接地址
    //   urls: [`amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`],
        
      exchange: 'nest_rabbitmq',   // 交换机名称
      queue: {
          inventoryCheck: 'inventory_check_queue',
          inventoryReduce: 'inventory_reduce_queue',
          inventoryReduceDone: 'inventory_reduce_queue_done',
      },
};
  