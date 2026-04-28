# Google Cloud and Firebase usage (inventory)

This document is the canonical map of **which Google products this repository uses**, **where they are configured**, and **how the SPA reaches backends**. It complements [GCP_PROVISIONING.md](GCP_PROVISIONING.md) (one-time setup) and the deploy section in [README.md](../README.md).

## Region and transport

- **Cloud Functions (2nd gen)** and **Vertex AI** calls use region **`asia-south1`** (see [`functions/src/index.ts`](../functions/src/index.ts) `CALLABLE_BASE` and `VERTEX_LOCATION`).
- The Angular app calls HTTPS callables via **`CloudFunctionsService`** ([`src/app/services/cloud-functions.service.ts`](../src/app/services/cloud-functions.service.ts)) using `getFunctions(getApp(), 'asia-south1')` and `httpsCallable`, with **App Check** token refresh when App Check is enabled.

## Firebase (client SPA)

| Product | Role | Code / config |
|--------|------|----------------|
| **Firebase App** | Bootstrap web SDK when public config is present | [`src/app/app.config.ts`](../src/app/app.config.ts) `buildFirebaseClientProviders()`, [`src/app/firebase/firebase-public.ts`](../src/app/firebase/firebase-public.ts), [`src/assets/config/firebase-public.json`](../src/assets/config/firebase-public.json) |
| **Firebase App Check** | reCAPTCHA Enterprise; tokens for Firestore and callables | `initializeAppCheck` + `ReCaptchaEnterpriseProvider` in `app.config.ts` when `appCheckSiteKey` is set |
| **Cloud Firestore** | Optional overlay for published election pack when Remote Config requests it; also registered via AngularFire when Firebase is configured | [`src/app/services/election-pack.service.ts`](../src/app/services/election-pack.service.ts), `provideFirestore` in `app.config.ts` |
| **Firebase Remote Config** | Feature flags (`footer_promo_text`, `rajya_sabha_preview`, `election_pack_channel`) | [`src/app/services/remote-config-feature.service.ts`](../src/app/services/remote-config-feature.service.ts) |
| **Firebase Performance** | Client performance traces | `providePerformance` in `app.config.ts` |
| **Firebase Analytics (GA4)** | Usage analytics when `measurementId` is configured | `provideAnalytics` in `app.config.ts`; consent wired via [`PrivacyConsentService`](../src/app/services/privacy-consent.service.ts) |
| **Firebase Cloud Functions** | Callable HTTPS functions from the browser | [`CloudFunctionsService`](../src/app/services/cloud-functions.service.ts) |

## Firebase / GCP (hosting and CI)

| Product | Role | Location |
|--------|------|----------|
| **Firebase Hosting** | SPA + security headers + CSP | [`firebase.json`](../firebase.json) |
| **Cloud Firestore** | Rules and optional native data for published packs | `firebase.json`, [`firestore.rules`](../firestore.rules) |
| **Cloud Build** | CI pipeline: install, test, build, optional `firebase deploy` | [`cloudbuild.yaml`](../cloudbuild.yaml) |
| **Artifact Registry** | Container images for Functions gen2 (managed by Firebase/GCP) | Deploy docs in README |
| **GitHub Actions** | Submits Cloud Build when `GCP_SA_KEY` is configured | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) (`deploy-cloud-build` job) |

## Cloud Functions backend (Node 20)

All exports are in [`functions/src/index.ts`](../functions/src/index.ts). **App Check** is enforced on every callable (`enforceAppCheck: true`).

| Callable | Google APIs / services | Request (summary) | Response (summary) |
|----------|-------------------------|-------------------|---------------------|
| **`assistantAsk`** | **Vertex AI** (Gemini models; `@google-cloud/vertexai`) | `{ prompt: string }` | `{ reply: string, citations: string[] }` |
| **`glossaryTranslate`** | **Cloud Translation API** (REST v2); **Secret Manager** secret `GOOGLE_TRANSLATE_API_KEY` | `{ texts: string[], target: string }` | `{ translations: string[] }` |
| **`exportTimelineSheet`** | **Google Sheets API** (`googleapis`); **Secret Manager** secret `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` | `{ rows: string[][] }` | `{ spreadsheetUrl: string, spreadsheetId: string }` |

Supporting runtime pieces:

- **Secret Manager** — secret *names* bound with `defineSecret` in code; values set in GCP, never committed.
- **Cloud Logging** — structured and error logs via `firebase-functions/logger`.

## Optional client integrations

- **Google Fonts** — loaded per theme / index as configured in the Angular app.
- **Google Maps Embed API** — optional when a maps embed key is configured (see README / environment docs).

## Related ADRs

- [0002-firebase-app-check-and-enforcement.md](adr/0002-firebase-app-check-and-enforcement.md) — App Check and enforcement strategy.
