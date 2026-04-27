# Security policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` branch | Yes |

## Reporting a vulnerability

Do not open public issues for security problems. Contact maintainers through your organization’s private channel or GitHub **private vulnerability reporting** if enabled.

## Practices in this repository

- No API keys, service account JSON, or passwords in git.
- **Firestore Security Rules** deny all writes from the web client for MVP paths.
- **CSP** and security headers configured in `firebase.json` for Hosting (including domains required by **App Check** / reCAPTCHA Enterprise and Firebase Performance). `style-src` omits `'unsafe-inline'` so styles must come from same-origin bundles and `https://fonts.googleapis.com` stylesheets. **Nonce-based `style-src` (or SSR-injected CSP)** is the next step if a future build introduces required inline styles; that needs a **per-request** nonce (for example **Angular SSR**, **Firebase App Hosting** with a Cloud Function, or an **edge worker**), because a static nonce in `firebase.json` would not be secret.
- **Cloud Functions** validate input length; callable `assistantAsk` uses **`enforceAppCheck: true`** (see `functions/src/index.ts`).
- Dependencies updated via **Dependabot**; **CodeQL** runs on default branches.

## Firebase App Check (reCAPTCHA Enterprise)

1. In **Google Cloud Console**, enable **reCAPTCHA Enterprise** for the project and create a **Web** key for the Hosting site origin(s).
2. In **Firebase Console → App Check**, register the **Web** app with the **reCAPTCHA Enterprise** provider using that site key.
3. Turn on **Enforcement** for **Cloud Firestore** and **Cloud Functions** (callable) once clients send valid tokens.
4. Fill `src/assets/config/firebase-public.json` at deploy time (or replace via your pipeline) with the Firebase web config fields and **`appCheckSiteKey`**. Do not commit real API keys in public forks; use CI secrets to generate this file for release builds only.
5. The SPA calls `initializeAppCheck` with `ReCaptchaEnterpriseProvider` when `appCheckSiteKey` is non-empty (`FirebaseBootstrapService`).

**Local development:** leave `appCheckSiteKey` empty to skip App Check initialization, or use a [debug provider](https://firebase.google.com/docs/app-check/web/debug-provider) registered in the Firebase console for trusted machines.

**Firestore rules:** client reads are path-restricted in `firestore.rules`; App Check is additionally enforced at the **Firebase API** layer when enforcement is enabled in the console. Rules include an inline reminder next to the `contentPacks` match.

## Firebase Performance Monitoring

When a non-empty Firebase web config is present, the app initializes **Performance Monitoring** (`firebase/performance`) in the browser for real-user metrics. Disable or strip in privacy-sensitive deployments if required by policy.

## Firebase Analytics (GA4)

When `measurementId` is non-empty in `src/assets/config/firebase-public.json` and the browser passes `isSupported()`, the app initializes **Google Analytics** (`firebase/analytics`). Leave `measurementId` empty in environments where analytics must stay off. Configure the GA4 stream in the Firebase / Google Analytics console for the same project.

## Google Cloud budget alerts

Budget export and alerting are **not** defined in this repository. In **Google Cloud Console → Billing → Budgets & alerts**, create at least one budget tied to the project (or billing account) with email or Pub/Sub notification channels and thresholds you are comfortable with, then confirm alerts in a test window.

## Visual regression (Percy)

Optional **Percy** snapshots run in CI when the repository secret `PERCY_TOKEN` is set (`percy` job in `.github/workflows/ci.yml`). Add `@percy/playwright` tests under `e2e/percy.spec.ts` and extend snapshots as the UI grows.
