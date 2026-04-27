# Google Cloud and Firebase boundaries

## Project shape

- Single GCP project hosts Firebase (Firestore, Hosting, Functions, App Check, Analytics, Remote Config).
- Billing attaches to your credits-backed billing account in Cloud Console.

## Firestore collections (MVP)

| Collection | Client read | Client write | Notes |
|------------|-------------|--------------|-------|
| `contentPacks/{packId}` | Allowed for published `packId` only | Deny all | Document holds optional remote mirror of Lok Sabha pack |
| All other paths | Deny | Deny | Expand only with reviewed rules |

Server-side writes (if any) use Admin SDK in Cloud Functions with a dedicated service account, never the web client.

## Callable Functions (optional)

- `assistantAsk`: requires App Check; reads only curated snippets from Firestore; calls Vertex AI with allowlisted model; no client API keys.

## Secrets

- Vertex and any third-party keys live in **Secret Manager**. CI deploy uses Workload Identity Federation or short-lived credentials, not committed JSON keys.

## Local development

- Use Firebase emulators for Firestore and Functions when testing integration paths.
- Without emulator or production config, the Angular app loads the static pack from `assets/content/india-lok-sabha.json`.
