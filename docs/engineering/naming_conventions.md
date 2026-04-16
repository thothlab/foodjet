# FoodJet Naming Conventions

Consistent naming across all layers of the application.

## Database

### Tables
- **snake_case, plural**
- Examples: `stores`, `products`, `orders`, `users`, `order_items`, `delivery_zones`, `cart_items`, `audit_logs`

### Columns
- **snake_case**
- Examples: `created_at`, `store_id`, `is_active`, `total_amount`, `delivery_zone_id`

### Foreign keys
- Pattern: `<referenced_table_singular>_id`
- Examples: `store_id`, `user_id`, `order_id`, `product_id`, `category_id`

### Indexes
- Pattern: `idx_<table>_<columns>`
- Examples: `idx_orders_store_id`, `idx_products_category_id_is_active`

## API

### Routes
- **kebab-case**
- Prefix: `/api/v1/`
- Examples:
  - `/api/v1/stores`
  - `/api/v1/stores/:storeId/products`
  - `/api/v1/cart-items`
  - `/api/v1/delivery-zones`
  - `/api/v1/order-items`
  - `/api/v1/audit-logs`

### Request/Response bodies
- **camelCase** for JSON field names
- Examples: `storeId`, `totalAmount`, `createdAt`, `isActive`, `deliveryZoneId`

## TypeScript

### Variables and functions
- **camelCase**
- Examples: `getStoreById`, `orderTotal`, `isDeliveryAvailable`, `handleOrderConfirmation`

### Types and classes
- **PascalCase**
- Examples: `Store`, `OrderItem`, `CreateProductDto`, `DeliveryZone`, `CartService`

### Interfaces
- **PascalCase**, no `I` prefix
- Examples: `Store` (not `IStore`), `OrderRepository` (not `IOrderRepository`)

### Enums
- Enum name: **PascalCase**
- Enum values: **UPPER_SNAKE_CASE**
- Examples:
  ```typescript
  enum OrderStatus {
    NEW = 'new',
    CONFIRMED = 'confirmed',
    ASSEMBLING = 'assembling',
    AWAITING_SUBSTITUTION_DECISION = 'awaiting_substitution_decision',
    READY_FOR_DELIVERY = 'ready_for_delivery',
    ASSIGNED_TO_COURIER = 'assigned_to_courier',
    IN_DELIVERY = 'in_delivery',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
  }

  enum UserRole {
    SUPER_ADMIN = 'super_admin',
    STORE_MANAGER = 'store_manager',
    STORE_OPERATOR = 'store_operator',
    CATALOG_MANAGER = 'catalog_manager',
    COURIER = 'courier',
  }
  ```

### Constants
- **UPPER_SNAKE_CASE**
- Examples: `MAX_CART_ITEMS`, `DEFAULT_PAGE_SIZE`, `TELEGRAM_BOT_TOKEN`

## Files and Directories

### General files
- **kebab-case**
- Examples: `order-service.ts`, `create-product.dto.ts`, `delivery-zone.repository.ts`, `audit-log.module.ts`

### React components
- **PascalCase**
- Examples: `ProductCard.tsx`, `OrderStatusBadge.tsx`, `CartSummary.tsx`, `DeliveryZoneSelector.tsx`

### Test files
- Same name as source file with `.test.ts` or `.spec.ts` suffix
- Examples: `order-service.test.ts`, `cart.controller.spec.ts`

## Status and Role Fields

### Status values (stored in DB and used in API)
- **snake_case**
- Examples: `new`, `confirmed`, `assembling`, `awaiting_substitution_decision`, `ready_for_delivery`, `assigned_to_courier`, `in_delivery`, `delivered`, `cancelled`

### Role names (stored in DB and used in API)
- **snake_case**
- `super_admin` -- platform-wide administrator
- `store_manager` -- full store control
- `store_operator` -- order processing
- `catalog_manager` -- catalog management
- `courier` -- delivery person

## Git

### Branch names
- **kebab-case** with prefix
- Patterns: `feature/<description>`, `fix/<description>`, `chore/<description>`
- Examples: `feature/order-substitution-flow`, `fix/cart-total-calculation`, `chore/update-dependencies`

### Commit messages
- Conventional commits format: `type(scope): description`
- Examples: `feat(orders): add substitution flow`, `fix(cart): correct total calculation`, `chore(deps): update telegram bot library`
