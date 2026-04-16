# Manual Release Checklist

Run through every item below on the **staging** environment before merging to `main`. Check the box only after verifying the step works end-to-end.

---

## 1. Customer Flows

- [ ] Open store via Telegram deep link (e.g. `https://t.me/bot?startapp=store_slug`) -- Mini App loads, correct store shown
- [ ] Browse categories -- tap each category, products load
- [ ] Search -- enter product name, results filter correctly
- [ ] Add to cart -- product appears in cart, badge updates, quantity adjustable
- [ ] Checkout with cash -- fill required fields, select cash payment, submit order
- [ ] View order status -- after placing order, status screen shows current status and updates in real time
- [ ] View order history -- navigate to history, past orders listed with correct statuses
- [ ] Reorder -- tap reorder on a past order, cart pre-filled, checkout works

---

## 2. Admin Flows

- [ ] Login -- admin opens admin panel, authenticates via Telegram
- [ ] Manage stores -- view store list, select a store
- [ ] Manage catalog
  - [ ] Create category
  - [ ] Create product (with image upload)
  - [ ] Edit product (change name, price, availability)
  - [ ] Delete product
- [ ] Manage orders
  - [ ] Confirm a new order
  - [ ] Mark order as assembling
  - [ ] Assign courier to order
  - [ ] Cancel an order (with reason)
- [ ] Manage staff -- invite operator, assign to store, remove operator
- [ ] Manage couriers -- create courier account, assign to store
- [ ] Edit store settings -- update delivery text, cash payment message, support contacts
- [ ] Edit working hours -- set hours, save, verify store opens/closes at correct times

---

## 3. Courier Flows

- [ ] Login -- courier opens courier app, authenticates via Telegram
- [ ] See assigned orders -- list shows orders assigned to this courier
- [ ] Mark in delivery -- tap action, status updates
- [ ] Mark delivered -- tap action, status updates, order moves to terminal state

---

## 4. Notifications

- [ ] Customer receives Telegram message when order is confirmed
- [ ] Customer receives Telegram message when order is in delivery
- [ ] Customer receives Telegram message when order is delivered
- [ ] Staff receives Telegram message when a new order is placed
- [ ] Courier receives Telegram message when an order is assigned to them

---

## 5. Access Control

- [ ] Store staff (operator) cannot view or manage a store they are not assigned to
- [ ] Courier cannot access admin panel pages
- [ ] Customer cannot see staff-only order details or actions
- [ ] Unauthenticated user is redirected / shown error on protected routes

---

## 6. Edge Cases

- [ ] **Closed store blocks orders** -- set store to closed, attempt to place order, verify rejection
- [ ] **Unavailable product blocks cart add** -- mark product unavailable, attempt to add to cart, verify rejection
- [ ] **Overnight working hours** -- set hours spanning midnight (e.g. 22:00 -- 06:00), verify store is open at 23:00 and closed at 07:00
- [ ] **Substitution flow** -- if substitution feature is enabled: operator suggests substitution, customer is notified, customer accepts/rejects

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| QA | | | |
| Backend dev | | | |
| Frontend dev | | | |
| Product owner | | | |
