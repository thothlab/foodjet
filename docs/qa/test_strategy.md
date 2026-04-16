# Test Strategy

## Overview

This document describes the testing approach for FoodJet: what we test, how we test it, and what must pass before every release.

---

## 1. Unit Tests

Unit tests cover isolated business logic with no external dependencies (database, network, Telegram API). All unit tests run via **Vitest**.

### Backend

| Area | What to test |
|---|---|
| Order status machine | Every valid transition (e.g. `PENDING -> CONFIRMED -> ASSEMBLING -> IN_DELIVERY -> DELIVERED`), rejection of invalid transitions, guard conditions |
| Checkout validation | Required fields present, delivery address format, minimum order amount, payment method allowed |
| Store open / closed | `isStoreOpen()` for normal hours, overnight hours (e.g. 22:00 -- 06:00), timezone edge cases, explicit closed status |
| RBAC checks | Each role (OWNER, MANAGER, OPERATOR, COURIER, CUSTOMER) can only access permitted resources; cross-store access denied |
| Cart behavior | Add item, remove item, update quantity, clear cart, cart belongs to one store at a time, stale product handling |
| Price calculations | Item subtotal, order total, rounding, zero-quantity edge case |

### Frontend

| Area | What to test |
|---|---|
| Form validation | Checkout form, catalog CRUD forms, store settings forms |
| State derivations | Cart total computation, order status display mapping, store open/closed badge |
| Utility functions | Price formatting, date/time helpers, slug generation |

---

## 2. Integration Tests

Integration tests verify that multiple modules work together correctly. They may use an in-memory or test database. Run via **Vitest**.

| Flow | Scope |
|---|---|
| Auth + bootstrap | Telegram `initData` validation -> JWT issue -> `/bootstrap` returns user + stores |
| Cart + checkout + create order | Add items to cart -> submit checkout -> order created in DB with correct status and line items |
| Order status transitions | Create order -> confirm -> assemble -> assign courier -> in delivery -> delivered; verify DB state and event emission at each step |
| Courier assignment | Assign courier to order -> courier sees order in their list -> courier can transition status |
| Cancellation | Cancel order at each allowed stage; verify stock is not affected, status is terminal, reason is recorded |

---

## 3. Frontend Smoke Tests

Smoke tests verify that key user journeys render and function without crashes. Run via **Vitest + Testing Library**.

### Customer Mini App

- App starts without errors after Telegram `initData` injection
- Category list renders with at least one category
- Search input accepts text and filters products
- Add product to cart; cart badge updates
- Checkout screen shows correct total and accepts submission
- Order history screen renders past orders

### Admin Panel

- Store list renders after login
- Catalog page: product list, create product form, edit product, delete product
- Order detail page: shows line items, status, action buttons (confirm, assemble, assign courier, cancel)

### Courier App

- Orders list renders assigned orders
- "Mark delivered" action updates order status on screen

---

## 4. Tools

| Tool | Purpose |
|---|---|
| **Vitest** | Backend unit & integration tests, frontend unit tests |
| **Vitest + @testing-library/react** | Frontend component and smoke tests |
| **msw** (Mock Service Worker) | HTTP mocking for frontend integration tests |
| **Supertest** (or equivalent) | HTTP-level backend integration tests |

---

## 5. Critical Flows (Must Pass Before Release)

The following flows are release-blocking. If any fails, the release is halted.

1. Customer can open store via deep link, browse catalog, add to cart, and place an order with cash payment.
2. Admin (operator) can confirm an order, mark it as assembling, and assign a courier.
3. Courier can see assigned order, mark it in delivery, and mark it delivered.
4. Customer receives Telegram notification on each status change.
5. Store with `isOpen = false` or outside working hours blocks new orders.
6. User with OPERATOR role cannot access a store they are not assigned to.
7. Checkout rejects a cart containing unavailable products.
8. Order cancellation works at every allowed stage and records a reason.
