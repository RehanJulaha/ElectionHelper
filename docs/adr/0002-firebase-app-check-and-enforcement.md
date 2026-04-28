# ADR 0002: Firebase App Check and API enforcement

## Status

Accepted

## Context

Public Hosting and callable Cloud Functions are abuse targets. Firebase App Check with **reCAPTCHA Enterprise** is the supported attestation path for web clients.

## Decision

1. Register the web app in Firebase App Check with reCAPTCHA Enterprise; enable **enforcement** for Cloud Firestore and Cloud Functions when traffic is ready for production.
2. Initialize App Check in the SPA only when `src/assets/config/firebase-public.json` contains a non-empty `appCheckSiteKey` (see `src/app/app.config.ts` via `provideAppCheck` inside `buildFirebaseClientProviders`).
3. Callable `assistantAsk` uses `enforceAppCheck: true` in `functions/src/index.ts`.
4. Extend Hosting **CSP** in `firebase.json` to allow required Google / App Check endpoints.

## Consequences

- Positive: reduced scripted abuse against Firestore and callables.
- Negative: local and CI environments need either empty keys (skip init) or debug tokens; CSP must stay aligned with Firebase SDK endpoints.
