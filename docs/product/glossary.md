# FoodJet Glossary and Naming Rules

## Core Entities

### Store
An individual store on the platform. Each store has its own catalog, staff, delivery zones, and settings. In the MVP, one tenant equals one store (the tenant abstraction is not exposed separately).

> Do NOT use "tenant" in code or UI. Use "store" everywhere.

### Customer
The end user who browses catalogs, places orders, and receives deliveries. Customers interact with the platform through the Telegram bot and Mini App.

### Staff
Store employees who manage operations. Staff members are always scoped to a specific store (except super_admin).

**Staff roles:**

| Role | Description |
|---|---|
| `super_admin` | Global platform administrator. Manages stores and platform-wide settings. Not tied to a single store. |
| `store_manager` | Full control over a specific store: catalog, orders, staff, settings, delivery zones. |
| `store_operator` | Processes orders within a store: confirms, manages assembly, handles substitutions, assigns couriers. |
| `catalog_manager` | Manages the store catalog: products, categories, prices, availability. No access to orders or staff management. |

### Courier
A delivery person who picks up orders from a store and delivers them to customers. Assigned to orders by store operators.

**Role name:** `courier`

### Platform Admin
The global administrator role (`super_admin`). Has access to all stores and platform-level configuration.

## Order Domain

### Order
A confirmed request from a customer for delivery of one or more products from a single store.

### Order Statuses

| Status | Description |
|---|---|
| `new` | Order placed by customer, awaiting store confirmation |
| `confirmed` | Store has accepted the order |
| `assembling` | Store staff is collecting/preparing the items |
| `awaiting_substitution_decision` | One or more items need substitution; waiting for customer approval |
| `ready_for_delivery` | Order is packed and ready to be picked up by a courier |
| `assigned_to_courier` | A courier has been assigned to deliver the order |
| `in_delivery` | Courier has picked up the order and is en route to the customer |
| `delivered` | Order successfully delivered to the customer |
| `cancelled` | Order has been cancelled (by customer, store, or system) |

### Cart
A pre-order collection of items that the customer is building before placing an order. Each customer has one cart per store.

## Catalog Domain

### Product
An item available for purchase in a store's catalog. Has a name, description, price, image, category, and availability status.

### Category
A logical grouping of products within a store's catalog (e.g., "Drinks", "Snacks", "Dairy"). Categories are store-specific.

## Delivery Domain

### Address
A customer's delivery address. In the MVP, addresses are **text-based only** -- no map coordinates, no geocoding. Stored as a structured text field (street, building, apartment, entrance, floor, comments).

### Delivery Zone
A text description of an area where a store delivers. Defined by the store manager as free-text entries (e.g., district names, settlement names). Customers select their zone when placing an order.
