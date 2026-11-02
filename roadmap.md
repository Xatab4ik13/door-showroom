# Tasks
- [ ] Item 8: remove duplicated article/technical data presentation without hiding distinct characteristics.
- [x] Item 7: implement persistent characteristic deletion while preserving supplier metadata; 5 PostgreSQL regression tests passed.
- [ ] Item 7: verify admin save and reopen on the live site; blocked by VPS backend deployment and an authenticated admin session.
- [x] Item 6: clicking the selected internal panel clears it; verified on a real product (23400 → 21400 RUB) and in the cart without the panel; 2 regression tests passed.
- [x] Item 5: return to the same catalog position, page and filters; tested button and browser Back with real API products (page 2, scroll 1844), plus search and sort preservation.
- [x] Normalize dimensions anywhere in product names for grouping and size selection.
- [x] Test PostgreSQL grouping with supplier names and distinct finishes.
- [ ] Verify the updated live catalog and size selection after VPS deployment; blocked by deployment on the user's server.