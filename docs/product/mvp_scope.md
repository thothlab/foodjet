# FoodJet MVP Scope

## Overview

FoodJet is a multi-store delivery platform operated through a single Telegram bot with an integrated Mini App. Each store gets a unique deep link for customer access.

## Core Principles

- One Telegram bot serves all stores on the platform
- Multiple stores coexist within a single platform instance
- Each store is accessible via its own deep link (e.g., `t.me/FoodJetBot?start=store_slug`)
- Architecture: **modular monolith**
- All business logic validation happens on the **backend only** (never trust the client)
- Telegram authentication is validated on the backend
- Audit log is maintained for all critical changes (order status transitions, price changes, role assignments, etc.)

## Client Interface

- **Telegram Bot** -- entry point, notifications, order status updates
- **Telegram Mini App** -- store catalog browsing, cart management, order placement, order history

## Payment

- **Cash on delivery only**
- No online payments, no card processing, no Apple Pay / Google Pay

## Delivery Zones

- **Text description only** -- districts, settlements, neighborhoods described in free text
- Store manager defines delivery zones as text entries (e.g., "Almaty, Bostandyk district")
- Customer selects or confirms their delivery zone from the store's list
- No maps, no geozones, no polygons, no geocoding

## What is IN the MVP

| Area | Details |
|---|---|
| Multi-store platform | Stores with independent catalogs, settings, staff |
| Store catalog | Categories, products, prices, images, availability toggle |
| Customer flow | Browse catalog, add to cart, place order, track status via bot notifications |
| Order lifecycle | Full status flow: new -> confirmed -> assembling -> ready_for_delivery -> assigned_to_courier -> in_delivery -> delivered / cancelled |
| Substitution flow | Store can propose substitutions; customer approves or rejects via bot |
| Staff roles | super_admin, store_manager, store_operator, catalog_manager, courier |
| Store admin panel | Manage catalog, view/process orders, manage staff, configure delivery zones and store settings |
| Platform admin | Manage stores, manage platform-wide settings |
| Notifications | Telegram messages for order status changes, new orders (to staff), substitution requests |
| Auth | Telegram-based authentication, validated on backend |
| Audit log | Log of critical changes with actor, timestamp, and diff |

## What is NOT in the MVP

- Online payments (card, Apple Pay, Google Pay)
- Maps, geozones, polygons, geocoding, geofencing
- Live courier tracking
- Route optimization
- Automatic courier assignment / auto-dispatch
- ERP / POS integrations
- Loyalty programs, cashback, bonuses
- Promo engine (discount codes, campaigns)
- In-app customer chat / support
- Reviews and ratings
- Split shipments
- Advanced BI / analytics dashboards

## Architecture Notes

- **Modular monolith** -- logically separated modules (store, catalog, order, user, notification, audit) within a single deployable unit
- Modules communicate through well-defined internal interfaces, making future extraction into microservices straightforward
- Database: single PostgreSQL instance with schema-level separation where appropriate
- All API endpoints enforce authorization based on user role and store membership
- Rate limiting and input validation on all public endpoints
