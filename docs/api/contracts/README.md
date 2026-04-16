# API Contracts

Base URL: `/api/v1`

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/telegram | No | Authenticate via Telegram initData |
| GET | /auth/me | Yes | Get current user info |

## Stores (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /stores/resolve/:slug | No | Resolve store by deep link slug |
| GET | /stores/:storeId/bootstrap | No | Get store bootstrap (info, settings, working hours) |

## Stores (Admin)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /stores | Yes | SUPER_ADMIN |
| POST | /stores | Yes | SUPER_ADMIN |
| PUT | /stores/:storeId | Yes | SUPER_ADMIN, STORE_MANAGER |
| PUT | /stores/:storeId/settings | Yes | SUPER_ADMIN, STORE_MANAGER |
| PUT | /stores/:storeId/status | Yes | SUPER_ADMIN |
| GET | /stores/:storeId/working-hours | Yes | SUPER_ADMIN, STORE_MANAGER |
| PUT | /stores/:storeId/working-hours | Yes | SUPER_ADMIN, STORE_MANAGER |

## Catalog (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /stores/:storeId/categories | No | List active categories |
| GET | /stores/:storeId/products | No | List active products (paginated) |
| GET | /stores/:storeId/products/search?q= | No | Search products |
| GET | /products/:productId | No | Get product detail |

## Catalog (Admin)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | /stores/:storeId/categories | Yes | SUPER_ADMIN, STORE_MANAGER, CATALOG_MANAGER |
| PUT | /categories/:categoryId | Yes | SUPER_ADMIN, STORE_MANAGER, CATALOG_MANAGER |
| DELETE | /categories/:categoryId | Yes | SUPER_ADMIN, STORE_MANAGER, CATALOG_MANAGER |
| POST | /stores/:storeId/products | Yes | SUPER_ADMIN, STORE_MANAGER, CATALOG_MANAGER |
| PUT | /products/:productId | Yes | SUPER_ADMIN, STORE_MANAGER, CATALOG_MANAGER |
| DELETE | /products/:productId | Yes | SUPER_ADMIN, STORE_MANAGER, CATALOG_MANAGER |
| PUT | /products/:productId/availability | Yes | SUPER_ADMIN, STORE_MANAGER, CATALOG_MANAGER |

## Cart (Customer)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /stores/:storeId/cart | Yes | Get cart with items |
| POST | /stores/:storeId/cart/items | Yes | Add item to cart |
| PUT | /stores/:storeId/cart/items/:productId | Yes | Update item quantity |
| DELETE | /stores/:storeId/cart/items/:productId | Yes | Remove item |
| DELETE | /stores/:storeId/cart | Yes | Clear cart |
| POST | /stores/:storeId/cart/validate | Yes | Validate cart items |

## Orders (Customer)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /stores/:storeId/orders | Yes | Create order from cart |
| GET | /orders/my | Yes | List my orders |
| GET | /orders/:orderId | Yes | Get order detail |
| POST | /orders/:orderId/cancel | Yes | Cancel order |
| POST | /orders/:orderId/reorder | Yes | Reorder from previous |

## Orders (Staff)

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /stores/:storeId/orders | Yes | SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR |
| GET | /stores/:storeId/orders/:orderId | Yes | SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR |
| POST | /stores/:storeId/orders/:orderId/transition | Yes | SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR |
| POST | /stores/:storeId/orders/:orderId/assign-courier | Yes | SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR |
| POST | /stores/:storeId/orders/:orderId/items/:itemId/substitution | Yes | SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR |

## Orders (Courier)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /courier/orders | Yes | List assigned orders |
| GET | /courier/orders/:orderId | Yes | Get order detail |
| POST | /courier/orders/:orderId/transition | Yes | Change delivery status |

## Customer Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /profile | Yes | Get/create profile |
| PUT | /profile | Yes | Update profile |
| GET | /addresses | Yes | List addresses |
| POST | /addresses | Yes | Create address |
| PUT | /addresses/:addressId | Yes | Update address |
| DELETE | /addresses/:addressId | Yes | Delete address |

## Staff

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /stores/:storeId/staff | Yes | SUPER_ADMIN, STORE_MANAGER |
| POST | /stores/:storeId/staff | Yes | SUPER_ADMIN, STORE_MANAGER |
| DELETE | /staff-assignments/:assignmentId | Yes | SUPER_ADMIN, STORE_MANAGER |

## Couriers

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /stores/:storeId/couriers | Yes | SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR |
| GET | /stores/:storeId/couriers/active | Yes | SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR |
| POST | /stores/:storeId/couriers | Yes | SUPER_ADMIN, STORE_MANAGER |
| PUT | /couriers/:courierId/status | Yes | SUPER_ADMIN, STORE_MANAGER |

## Media

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /upload/image | Yes | Upload product image (multipart) |

## Audit

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /audit | Yes | SUPER_ADMIN, STORE_MANAGER |

## Notifications

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | /stores/:storeId/notifications | Yes | Store staff |
