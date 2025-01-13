
export const RABBITMQ_CONFIG = {
    uri: 'amqp://localhost:5672', // RabbitMQ 的连接地址
    exchange: 'order_exchange',   // 交换机名称
    queue: {
      inventoryCheck: 'inventory_check_queue',
      inventoryReduce: 'inventory_reduce_queue',
      inventoryReduceDone: 'inventory_reduce_queue_done',
    },
  };
  