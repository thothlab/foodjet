# Operations Runbook

This runbook covers common operational issues, monitoring, and procedures for FoodJet.

---

## 1. Common Issues and Fixes

### Bot not sending messages

**Symptoms:** Customer does not receive Telegram notifications after order status changes.

**Diagnosis:**

1. **Check `TELEGRAM_BOT_TOKEN`.** Verify the token is set and valid:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```
   A valid token returns `"ok": true` with bot info.

2. **Check if the bot is blocked by the user.** The Telegram API returns error 403 "Forbidden: bot was blocked by the user" when sending to a user who blocked the bot. Check notification logs for this error. This is expected behavior -- the user must unblock the bot.

3. **Check notification logs.** Search structured logs for:
   - `notification.send.failed` -- indicates a delivery failure
   - `notification.send.success` -- confirms delivery is working for other users
   - Look at the error message and Telegram API response code

4. **Check bot process is running.** Verify the bot process is alive and connected to Telegram's polling/webhook.

**Resolution:**
- If token is invalid: rotate the token via @BotFather and update the environment variable, then restart.
- If user blocked bot: no action needed, this is user-initiated.
- If bot process crashed: restart the process and investigate crash logs.

---

### Store not opening from deep link

**Symptoms:** User taps the Telegram deep link but sees an error or blank screen instead of the store.

**Diagnosis:**

1. **Check store slug exists.** Query the database:
   ```sql
   SELECT id, slug, status FROM stores WHERE slug = '<slug>';
   ```
   If no row is returned, the slug is wrong or the store was not created.

2. **Check store status is ACTIVE.** Only stores with `status = 'ACTIVE'` are accessible. If status is `DRAFT` or `DISABLED`, the store will not load.

3. **Check Mini App URL configuration.** Verify the Telegram Mini App URL points to the correct frontend deployment. The URL is configured via @BotFather under the Mini App settings.

4. **Check frontend deployment.** Open the Mini App URL directly in a browser to verify it loads.

**Resolution:**
- If slug is missing: create the store or fix the deep link.
- If status is not ACTIVE: update the store status via admin panel.
- If Mini App URL is wrong: update it via @BotFather.

---

### Orders not being created

**Symptoms:** Customer submits checkout but receives an error; no order appears in the admin panel.

**Diagnosis:**

1. **Check store is open.** Verify current time falls within the store's working hours:
   ```sql
   SELECT working_hours FROM store_settings WHERE store_id = '<store_id>';
   ```
   Compare with the current time in the store's timezone.

2. **Check order acceptance is enabled.** Some stores may have order acceptance temporarily disabled:
   ```sql
   SELECT order_acceptance_enabled FROM store_settings WHERE store_id = '<store_id>';
   ```

3. **Check cart validation.** The backend rejects orders if:
   - Any product in the cart is unavailable (`is_available = false`)
   - Any product price has changed since it was added to the cart
   - The cart is empty
   - The store in the cart does not match the checkout store

4. **Check backend logs.** Search for `order.create.failed` or `checkout.validation.failed` with the user's Telegram ID.

**Resolution:**
- If store is closed: wait for opening hours or adjust working hours.
- If order acceptance disabled: enable it in admin panel.
- If cart validation fails: the customer needs to update their cart.

---

### Database connection issues

**Symptoms:** Backend returns 500 errors; logs show connection errors.

**Diagnosis:**

1. **Check `DATABASE_URL`.** Verify the connection string is correct and the password has not been rotated.

2. **Check PostgreSQL is running:**
   ```bash
   pg_isready -h <host> -p <port>
   ```

3. **Check connection pool.** Look for "too many connections" errors in logs. The pool may be exhausted if:
   - A migration is holding a lock
   - A long-running query is blocking connections
   - The pool size is too small for the current load

4. **Check disk space.** PostgreSQL stops accepting writes if the disk is full.

**Resolution:**
- If credentials changed: update `DATABASE_URL` and restart.
- If PostgreSQL is down: restart the database service.
- If pool exhausted: identify and kill blocking queries, consider increasing pool size.
- If disk full: free space or expand the volume.

---

## 2. Monitoring

### Health check

The backend exposes a `GET /health` endpoint that returns:
- `200 OK` with `{ "status": "ok" }` when the service is healthy
- `503 Service Unavailable` when the database connection is down

Set up an external monitor (e.g. UptimeRobot, Healthchecks.io) to ping `/health` every 60 seconds.

### Structured logs

All backend logs are structured JSON. Key fields to monitor:

| Field | What to watch |
|---|---|
| `level: "error"` | Any error-level log warrants investigation |
| `event: "notification.send.failed"` | Telegram notification delivery failures |
| `event: "order.create.failed"` | Order creation failures |
| `event: "auth.failed"` | Authentication failures (possible abuse) |

### Notification failure rate

Track the ratio of `notification.send.failed` to `notification.send.success`. A sudden spike indicates a bot issue (token revoked, rate limited, etc.).

Acceptable failure rate: < 5% (most failures are user-blocked-bot, which is normal).

---

## 3. How to Add a New Store (Step by Step)

Follow these steps to onboard a new store. See also `docs/ops/store_onboarding_checklist.md` for the full checklist.

1. **Create the store** in the admin panel:
   - Set a unique slug (used in the deep link, e.g. `my-cafe`)
   - Set the store name and description
   - Status will default to `DRAFT`

2. **Configure store settings:**
   - Delivery text (shown to customer at checkout)
   - Cash payment message
   - Support contact information

3. **Set working hours** for each day of the week. Use 24-hour format. For overnight hours, set start > end (e.g. 22:00 -- 06:00).

4. **Create categories** to organize the menu (e.g. "Burgers", "Drinks", "Desserts").

5. **Add products** to each category:
   - Name, description, price
   - Upload product image
   - Set `is_available = true`

6. **Assign staff:**
   - Assign a store manager (MANAGER role)
   - Assign operators (OPERATOR role)
   - Operators will receive new order notifications

7. **Create courier accounts:**
   - Create users with COURIER role
   - Assign them to the store

8. **Test the deep link:**
   ```
   https://t.me/<bot_username>?startapp=<store_slug>
   ```
   Verify the store loads correctly in the Mini App.

9. **Test the full order flow:**
   - Place a test order as a customer
   - Confirm and process it as an operator
   - Deliver it as a courier
   - Verify notifications at each step

10. **Go live:**
    - Change store status from `DRAFT` to `ACTIVE`
    - Share the deep link with the store owner
    - Monitor the first real orders for issues
