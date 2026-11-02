# Tasks
- [ ] Item 7: persist deleted product characteristics while preserving supplier metadata and unedited internal fields.
- [x] Item 6: clicking the selected internal panel clears it; verified on a real product (23400 → 21400 RUB) and in the cart without the panel; 2 regression tests passed.
- [x] Item 5: return to the same catalog position, page and filters; tested button and browser Back with real API products (page 2, scroll 1844), plus search and sort preservation.
- [x] Normalize dimensions anywhere in product names for grouping and size selection.
- [x] Test PostgreSQL grouping with supplier names and distinct finishes.
- [ ] Verify the updated live catalog and size selection after VPS deployment; blocked by deployment on the user's server.