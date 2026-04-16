# RBAC Matrix

## Roles

### Platform Roles

| Role        | Scope    | Description                              |
| ----------- | -------- | ---------------------------------------- |
| SUPER_ADMIN | Platform | Full access to all resources across all stores |

### Store Roles

| Role             | Scope | Description                                             |
| ---------------- | ----- | ------------------------------------------------------- |
| STORE_MANAGER    | Store | Full access to all operations within their own store    |
| STORE_OPERATOR   | Store | Order management and courier oversight for their store  |
| CATALOG_MANAGER  | Store | Catalog and product management for their store          |

### Other Roles

| Role     | Scope    | Description                                      |
| -------- | -------- | ------------------------------------------------ |
| COURIER  | Store    | Delivery operations for their assigned store     |
| CUSTOMER | Platform | Own profile, cart, orders, and addresses         |

## Store Scope Rule

All store-level roles (STORE_MANAGER, STORE_OPERATOR, CATALOG_MANAGER, COURIER) can only access resources belonging to their assigned store. Cross-store access is denied.

## Permission Matrix

| Permission                     | SUPER_ADMIN | STORE_MANAGER | STORE_OPERATOR | CATALOG_MANAGER | COURIER | CUSTOMER |
| ------------------------------ | :---------: | :-----------: | :------------: | :-------------: | :-----: | :------: |
| **Stores**                     |             |               |                |                 |         |          |
| Create store                   | Yes         | ---           | ---            | ---             | ---     | ---      |
| Update store settings          | Yes         | Yes           | ---            | ---             | ---     | ---      |
| View store info                | Yes         | Yes           | Yes            | Yes             | Yes     | Yes      |
| Delete store                   | Yes         | ---           | ---            | ---             | ---     | ---      |
| **Catalog**                    |             |               |                |                 |         |          |
| Create/update categories       | Yes         | Yes           | ---            | Yes             | ---     | ---      |
| Create/update products         | Yes         | Yes           | ---            | Yes             | ---     | ---      |
| Delete products                | Yes         | Yes           | ---            | Yes             | ---     | ---      |
| View catalog                   | Yes         | Yes           | Yes            | Yes             | Yes     | Yes      |
| **Orders**                     |             |               |                |                 |         |          |
| View all store orders          | Yes         | Yes           | Yes            | ---             | ---     | ---      |
| Confirm/update order status    | Yes         | Yes           | Yes            | ---             | ---     | ---      |
| Cancel order (staff)           | Yes         | Yes           | Yes            | ---             | ---     | ---      |
| Cancel order (own)             | ---         | ---           | ---            | ---             | ---     | Yes      |
| Assign courier to order        | Yes         | Yes           | Yes            | ---             | ---     | ---      |
| Mark substitution needed       | Yes         | Yes           | Yes            | ---             | ---     | ---      |
| View own orders                | ---         | ---           | ---            | ---             | Yes     | Yes      |
| **Cart**                       |             |               |                |                 |         |          |
| Manage own cart                | ---         | ---           | ---            | ---             | ---     | Yes      |
| **Delivery**                   |             |               |                |                 |         |          |
| View assigned deliveries       | ---         | ---           | ---            | ---             | Yes     | ---      |
| Update delivery status         | ---         | ---           | ---            | ---             | Yes     | ---      |
| View all couriers (store)      | Yes         | Yes           | Yes            | ---             | ---     | ---      |
| Manage couriers (store)        | Yes         | Yes           | ---            | ---             | ---     | ---      |
| **Customers**                  |             |               |                |                 |         |          |
| View own profile               | ---         | ---           | ---            | ---             | ---     | Yes      |
| Update own profile             | ---         | ---           | ---            | ---             | ---     | Yes      |
| Manage own addresses           | ---         | ---           | ---            | ---             | ---     | Yes      |
| View customer list             | Yes         | Yes           | ---            | ---             | ---     | ---      |
| **Staff Management**           |             |               |                |                 |         |          |
| Invite/manage store staff      | Yes         | Yes           | ---            | ---             | ---     | ---      |
| View store staff               | Yes         | Yes           | Yes            | ---             | ---     | ---      |
| **Platform Admin**             |             |               |                |                 |         |          |
| Manage all stores              | Yes         | ---           | ---            | ---             | ---     | ---      |
| Manage platform settings       | Yes         | ---           | ---            | ---             | ---     | ---      |
| View audit logs                | Yes         | Yes           | ---            | ---             | ---     | ---      |
| **Notifications**              |             |               |                |                 |         |          |
| View own notifications         | ---         | ---           | ---            | ---             | Yes     | Yes      |
| View store notifications       | Yes         | Yes           | Yes            | ---             | ---     | ---      |
