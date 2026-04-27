# ADR 0003: Progressive Web App (service worker)

## Status

Accepted

## Context

Users in India may be on intermittent mobile networks; caching shell scripts, styles, and static election-pack assets improves repeat visits.

## Decision

Enable Angular’s **service worker** in production builds (`ngsw-config.json`, `provideServiceWorker` in `app.config.ts`) with prefetch for the app shell and lazy caching for `/assets/**`.

## Consequences

- Positive: faster repeat loads and better offline resilience for same-origin assets.
- Negative: deploy and cache-busting discipline required; updates ship with Angular’s `ngsw-worker` update flow.
