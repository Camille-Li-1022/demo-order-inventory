src/
├── order-service/      # 订单服务
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── events/
│   └── main.ts
├── inventory-service/  # 库存服务
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── events/
│   └── main.ts
├── queue/              # 消息队列配置
│   └── src/
│       ├── queue.module.ts
│       ├── queue.service.ts
│       └── queue.constants.ts
└── shared/             # 公共模块
    ├── src/
    │   ├── dto/
    │   ├── entities/
    │   ├── interfaces/
    │   └── utils/
    └── main.ts


流程步骤
1. 下单流程（Order-Service）
    用户发起下单请求（例如购买 productId=1001，quantity=2）。
    订单服务校验订单数据，确保用户权限和请求格式合法。
    订单服务将订单存储到 MySQL 的 orders 表，并将订单状态设置为 PENDING。
    向 RabbitMQ 的 inventory_reduce_queue 发布库存扣减消息（包含 productId 和 quantity）。

    curl -X POST http://localhost:3000/order/create \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": 1,
      "product_id": "product_1001",
      "quantity": 2
    }'

2. 消息队列处理（RabbitMQ）
    RabbitMQ 将订单服务发送的消息存入队列 inventory_reduce_queue。
    RabbitMQ 确保消息可靠传递至库存服务，且每条消息仅被消费一次。
3. 扣减库存（Inventory-Service）
    库存服务监听 RabbitMQ 的 inventory_reduce_queue 队列，收到库存扣减请求。
    使用 Redis 分布式锁确保并发下唯一服务处理该 productId 的扣减操作：
        获取锁（键名：lock:inventory:<productId>）。
        如果未获取到锁，直接返回或重试。
    查询 MySQL 数据库中对应的库存数据：
        如果库存不足，则记录失败日志并返回扣减失败状态。
        如果库存充足，则扣减库存并更新 MySQL。
    释放 Redis 锁。
4. 更新订单状态（Order-Service）
    库存扣减完成后，库存服务向 RabbitMQ 的 order_update_queue 队列发送消息：
    包含订单 ID 和库存扣减状态。
    订单服务监听 order_update_queue：
    如果库存扣减成功，则更新订单状态为 CONFIRMED。
    如果扣减失败，则更新订单状态为 FAILED 并通知用户。

5. 用户操作更新订单状态
    - 用户完成付款后，更新订单状态为 COMPLETE
    - 用户取消订单/用户申请退款退货，更新订单状态为 CANCEL

    curl -X POST http://localhost:3000/order/complete \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": 1,
      "order_id": 3
    }'

    
    curl -X POST http://localhost:3000/order/cancel \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": 2,
      "order_id": 4
    }'