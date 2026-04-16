# Store Onboarding Checklist

Use this checklist when setting up a new store on FoodJet. Complete every item before going live.

---

## Store Setup

- [ ] **Create store** via admin panel
  - [ ] Set unique slug (lowercase, hyphens only, e.g. `central-cafe`)
  - [ ] Set store name
  - [ ] Set store description
  - [ ] Store status is `DRAFT` (do not set to ACTIVE yet)

- [ ] **Configure store settings**
  - [ ] Delivery text (message shown to customer at checkout, e.g. "Delivery within 30-60 minutes")
  - [ ] Cash payment message (e.g. "Please prepare exact change")
  - [ ] Support contacts (phone number, Telegram handle, or both)

- [ ] **Set working hours**
  - [ ] Set hours for each day of the week
  - [ ] Verify overnight hours work correctly if applicable (e.g. 22:00 -- 06:00)
  - [ ] Set days off / holidays if needed

---

## Catalog

- [ ] **Create categories**
  - [ ] At least one category created
  - [ ] Categories ordered in the desired display sequence
  - [ ] Category names are clear and concise

- [ ] **Add products**
  - [ ] Every product has a name, description, and price
  - [ ] Every product has an image uploaded
  - [ ] Products are assigned to the correct category
  - [ ] Product availability is set (`is_available = true` for items in stock)
  - [ ] Prices are correct (double-check with store owner)

---

## Staff and Couriers

- [ ] **Assign store manager**
  - [ ] User created with MANAGER role
  - [ ] Assigned to this store
  - [ ] Manager can log in and see the store in admin panel

- [ ] **Assign operators**
  - [ ] At least one operator assigned to the store
  - [ ] Operators can log in and manage orders

- [ ] **Create courier accounts**
  - [ ] Courier users created with COURIER role
  - [ ] Couriers assigned to this store
  - [ ] Couriers can log in to the courier app and see their order list

---

## Testing

- [ ] **Test deep link**
  - [ ] Open `https://t.me/<bot_username>?startapp=<store_slug>` in Telegram
  - [ ] Mini App loads and displays the correct store
  - [ ] Categories and products render correctly
  - [ ] Product images load

- [ ] **Test order flow end-to-end**
  - [ ] Place a test order as a customer (cash payment)
  - [ ] Verify order appears in admin panel for the operator
  - [ ] Operator confirms the order
  - [ ] Operator marks the order as assembling
  - [ ] Operator assigns a courier
  - [ ] Courier sees the order in their app
  - [ ] Courier marks the order as in delivery
  - [ ] Courier marks the order as delivered
  - [ ] Customer receives Telegram notifications at each status change
  - [ ] Order appears in customer's order history with correct final status

---

## Go Live

- [ ] **Final review with store owner**
  - [ ] Store owner approves catalog (products, prices, images)
  - [ ] Store owner approves working hours
  - [ ] Store owner approves delivery text and support contacts

- [ ] **Activate store**
  - [ ] Change store status from `DRAFT` to `ACTIVE`
  - [ ] Verify the store is accessible via deep link

- [ ] **Share deep link**
  - [ ] Provide the deep link to the store owner
  - [ ] Store owner distributes the link to customers

- [ ] **Monitor first orders**
  - [ ] Watch the first 5-10 real orders for any issues
  - [ ] Verify notifications are being delivered
  - [ ] Confirm operators and couriers are handling orders smoothly

---

## Notes

| Field | Value |
|---|---|
| Store slug | |
| Store name | |
| Go-live date | |
| Onboarded by | |
| Store owner contact | |
