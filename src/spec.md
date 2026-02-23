# Specification

## Summary
**Goal:** Add a "My Account" page where customers can view their order history and check order status.

**Planned changes:**
- Create a new /account route displaying the customer's order history with order IDs, dates, statuses, and total amounts
- Add a "My Account" navigation link in the header visible only to authenticated non-admin users
- Make each order in the list clickable to navigate to the existing order details page
- Display a helpful message when the customer has no orders yet

**User-visible outcome:** Customers can click "My Account" in the header to view all their past orders and click on any order to see full details including products ordered.
