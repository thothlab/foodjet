# Notification Triggers

## Overview

Notifications are triggered by order lifecycle events. In the MVP phase, all notifications are delivered via Telegram.

## Event-to-Notification Mapping

| Event                  | Notification Code            | Recipients             | Description                                       |
| ---------------------- | ---------------------------- | ---------------------- | ------------------------------------------------- |
| Order created          | ORDER_NEW                    | Store staff            | New order received, needs attention                |
| Order confirmed        | ORDER_CONFIRMED              | Customer               | Order has been confirmed by the store              |
| Order assembling       | ORDER_ASSEMBLING             | Customer               | Store started assembling the order                 |
| Substitution needed    | ORDER_SUBSTITUTION_NEEDED    | Customer               | Item unavailable, customer decision required       |
| Courier assigned       | ORDER_COURIER_ASSIGNED       | Customer, Courier      | Courier assigned to deliver the order              |
| Order in delivery      | ORDER_IN_DELIVERY            | Customer               | Courier is on the way                              |
| Order delivered        | ORDER_DELIVERED              | Customer               | Order has been delivered successfully               |
| Order cancelled        | ORDER_CANCELLED              | Customer, Store staff  | Order has been cancelled                            |

## Delivery Channel

| Channel  | Status in MVP | Notes                           |
| -------- | ------------- | ------------------------------- |
| Telegram | Active        | Primary and only channel in MVP |
| Push     | Planned       | Mobile app push notifications   |
| SMS      | Planned       | Fallback for critical alerts    |
| Email    | Planned       | Order receipts, summaries       |

## Notification Flow

```
Order Event
    |
    v
Notification Service
    |
    +---> Check dedup (has this notification already been sent?)
    |         |
    |         +---> Already sent? Skip.
    |         +---> Not sent? Continue.
    |
    +---> Resolve recipients (customer, staff, courier)
    |
    +---> Build message from template
    |
    +---> Dispatch via Telegram
    |         |
    |         +---> Success: mark as SENT
    |         +---> Failure: retry (up to 3 attempts)
    |                   |
    |                   +---> All retries failed: mark as FAILED, log error
    |
    v
  Done
```

## Retry Policy

| Parameter     | Value | Description                                          |
| ------------- | ----- | ---------------------------------------------------- |
| Max attempts  | 3     | Maximum number of delivery attempts                  |
| Retry delay   | ---   | Implementation-defined (e.g., exponential backoff)   |
| On failure    | Log   | Log the failure with correlationId and error details |

## Deduplication

Before sending any notification, the service checks the notification status in the database:

- If a notification with the same `orderId + notificationCode + recipientId` already has status `SENT`, it is skipped.
- This prevents duplicate notifications in case of event replays or retries.

## Notification Statuses

| Status  | Description                                |
| ------- | ------------------------------------------ |
| PENDING | Notification created, not yet dispatched   |
| SENT    | Successfully delivered to Telegram         |
| FAILED  | All retry attempts exhausted               |
