# Order Status Machine

## Statuses

| Status                           | Description                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| NEW                              | Заказ создан, ожидает подтверждения от персонала или системы                |
| CONFIRMED                        | Заказ подтверждён, готов к сборке                                           |
| ASSEMBLING                       | Заказ собирается персоналом магазина                                        |
| AWAITING_SUBSTITUTION_DECISION   | Требуется решение клиента по замене товара                                  |
| READY_FOR_DELIVERY               | Заказ собран и готов к передаче курьеру                                     |
| ASSIGNED_TO_COURIER              | Курьер назначен на доставку заказа                                          |
| IN_DELIVERY                      | Заказ в процессе доставки                                                   |
| DELIVERED                        | Заказ доставлен клиенту (терминальный статус)                               |
| CANCELLED                        | Заказ отменён (терминальный статус)                                         |

## Transition Table

| From                           | To                             | Who can trigger       |
| ------------------------------ | ------------------------------ | --------------------- |
| NEW                            | CONFIRMED                      | staff, system         |
| NEW                            | CANCELLED                      | staff, customer       |
| CONFIRMED                      | ASSEMBLING                     | staff                 |
| CONFIRMED                      | CANCELLED                      | staff, customer       |
| ASSEMBLING                     | AWAITING_SUBSTITUTION_DECISION | staff                 |
| ASSEMBLING                     | READY_FOR_DELIVERY             | staff                 |
| ASSEMBLING                     | CANCELLED                      | staff                 |
| AWAITING_SUBSTITUTION_DECISION | ASSEMBLING                     | staff                 |
| AWAITING_SUBSTITUTION_DECISION | READY_FOR_DELIVERY             | staff                 |
| AWAITING_SUBSTITUTION_DECISION | CANCELLED                      | staff                 |
| READY_FOR_DELIVERY             | ASSIGNED_TO_COURIER            | staff                 |
| READY_FOR_DELIVERY             | CANCELLED                      | staff                 |
| ASSIGNED_TO_COURIER            | IN_DELIVERY                    | courier               |
| ASSIGNED_TO_COURIER            | READY_FOR_DELIVERY             | staff                 |
| ASSIGNED_TO_COURIER            | CANCELLED                      | staff                 |
| IN_DELIVERY                    | DELIVERED                      | courier               |
| IN_DELIVERY                    | CANCELLED                      | staff                 |
| DELIVERED                      | (terminal)                     | ---                   |
| CANCELLED                      | (terminal)                     | ---                   |

## State Diagram

```
                         staff/system             staff
                 +---------->  CONFIRMED  ------------>  ASSEMBLING
                 |               |                      /    |    \
                 |               | staff/customer      /     |     \
    NEW ---------+               v                    /      |      \
                 |           CANCELLED <-------------+       |       +---> READY_FOR_DELIVERY
                 |           (terminal)  <-----------+       |              |          |
                 |               ^                   |       v              |          |
                 +--- staff/ --->+                   +-- AWAITING_         |          |
                     customer                        |   SUBSTITUTION     |          |
                                                     |   _DECISION        |          |
                                                     |     |    |         |          |
                                                     +-----+    +--------+          |
                                                     staff       staff               |
                                                                                     |
                                                                              staff  |
                                                                                     v
                                                                          ASSIGNED_TO_COURIER
                                                                           |    |         |
                                                                    staff  |    | courier  | staff
                                                                     +----+    |          +---> CANCELLED
                                                                     |         v
                                                                     |      IN_DELIVERY
                                                                     |       |        |
                                                              (back to       | courier | staff
                                                            READY_FOR_       v        +---> CANCELLED
                                                            DELIVERY)     DELIVERED
                                                                          (terminal)
```

### Simplified Flow

```
NEW --> CONFIRMED --> ASSEMBLING --> READY_FOR_DELIVERY --> ASSIGNED_TO_COURIER --> IN_DELIVERY --> DELIVERED
  \        \             |    \            \                    |      \                 \
   v        v            v     v            v                   v       v                 v
 CANCEL   CANCEL      AWAIT   CANCEL     CANCEL             CANCEL  (back to          CANCEL
                      _SUBST                                         READY)
                       |  |
                       v  v
                     ASSEMB / READY / CANCEL
```
