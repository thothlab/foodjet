# Backend Modules

## Module Overview

| Module       | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| auth         | Authentication and authorization (JWT, login, registration, RBAC)  |
| store        | Store management, settings, working hours, delivery zones          |
| catalog      | Categories, products, images, availability                         |
| cart         | Shopping cart, item management, price calculation                   |
| order        | Order lifecycle, status machine, order history                     |
| customer     | Customer profiles, addresses, preferences                          |
| courier      | Courier profiles, availability, assignment                         |
| staff        | Store staff management, invitations, role assignment               |
| notification | Notification dispatch (Telegram), templates, delivery tracking     |
| audit        | Audit logging, event recording, activity history                   |
| media        | File uploads, image processing, storage                            |

## Module Details

### auth

- **Responsibility:** User registration, login, JWT token issuance and validation, role-based access control, permission checks.
- **Dependencies:** customer, staff, courier (for role resolution)

### store

- **Responsibility:** CRUD for stores, store settings (working hours, minimum order, delivery zones), store status.
- **Dependencies:** auth (permission checks)

### catalog

- **Responsibility:** CRUD for categories and products, product availability management, image association via media module.
- **Dependencies:** store, media, auth

### cart

- **Responsibility:** Cart creation and management, add/remove/update items, price and total calculation, cart validation before checkout.
- **Dependencies:** catalog (product data, availability, prices), store (store status), auth

### order

- **Responsibility:** Order creation from cart, order status machine (transitions, validation), order history, substitution management.
- **Dependencies:** cart, store, catalog, courier, notification, auth

### customer

- **Responsibility:** Customer profile management, delivery addresses, customer preferences.
- **Dependencies:** auth

### courier

- **Responsibility:** Courier profile management, availability status, store assignment, active delivery tracking.
- **Dependencies:** store, auth

### staff

- **Responsibility:** Store staff management, invitation flow, role assignment (STORE_MANAGER, STORE_OPERATOR, CATALOG_MANAGER).
- **Dependencies:** store, auth

### notification

- **Responsibility:** Notification dispatch to customers, staff, and couriers. Template management. Delivery status tracking. Retry logic.
- **Dependencies:** order (event subscription), store, auth

### audit

- **Responsibility:** Logging all significant actions (order status changes, staff actions, setting changes). Queryable event history.
- **Dependencies:** Subscribes to events from all modules

### media

- **Responsibility:** File upload handling (multipart/form-data), image processing/resizing, storage management.
- **Dependencies:** auth

## Shared Module

The `shared` module contains cross-cutting utilities used by all modules:

| Component      | Description                                             |
| -------------- | ------------------------------------------------------- |
| errors         | Custom error classes (AppError, ValidationError, etc.)  |
| error-handler  | Global error handler middleware, error envelope builder  |
| correlation-id | Middleware to generate/propagate X-Correlation-Id       |

## Config

Application-level configuration shared across all modules:

| Component | Description                                    |
| --------- | ---------------------------------------------- |
| env       | Environment variable loading and validation    |
| logger    | Structured logging (pino or similar)           |
| database  | Database connection pool and configuration     |

## Dependency Rules

1. **No circular dependencies.** If module A depends on module B, then module B must not depend on module A.
2. **Modules communicate through services.** Direct database access across module boundaries is forbidden. Use the target module's service layer.
3. **Shared module has no dependencies** on any business module.
4. **Event-driven communication** is preferred for cross-module side effects (e.g., order status change triggering notification).
