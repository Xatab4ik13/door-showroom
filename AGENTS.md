# Architecture rules

- Catalog grouping, grouped counts and sibling-size retrieval must use the same PostgreSQL model-key helper, scoped by supplier and category, so catalog cards and size choices stay consistent.
- Catalog cards capture scroll and filters in a session snapshot keyed by their history entry and pass an explicit return context to products; restore only after catalog loading finishes, so route resets cannot overwrite the saved position.
- The structured product editor explicitly replaces visible specs through specs_replace; preserve hidden supplier fields, overwrite submitted internal fields including empty arrays, and keep merge semantics for other PATCH clients to avoid losing enrichment data.