# Firestore composite indexes

`firestore.indexes.json` currently defines **no composite indexes** because the shipped SPA reads the Lok Sabha pack from **static assets** (`ElectionPackService`), not from Firestore queries.

## When to add an index

Add a composite (or single-field) index when you introduce client or admin queries that:

- Combine **multiple** `where` clauses on different fields, or
- Mix **`where`** with **`orderBy`** on a different field than the inequality filter, or
- Use **collection group** queries with filters.

After adding entries to `firestore.indexes.json`, deploy with:

```bash
npx firebase deploy --only firestore:indexes
```

The Firebase console will also suggest index JSON when a query fails in development.

## Related

- `docs/GCP_FIRESTORE_BOUNDARIES.md` — data and access boundaries
- `firestore.rules` — security rules for `contentPacks`
