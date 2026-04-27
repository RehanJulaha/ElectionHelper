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
- **CSP** and security headers configured in `firebase.json` for Hosting (including domains required by **App Check** / reCAPTCHA Enterprise and Firebase Performance). **`style-src` includes `'unsafe-inline'`** because the Angular framework runtime still applies styles the browser reports as inline (even with emulated encapsulation and external CSS bundles). On **static Firebase Hosting** there is no per-request nonce pipeline; removing `'unsafe-inline'` reliably breaks the app unless you add **SSR / App Hosting + `CSP_NONCE` / `ngCspNonce`** and matching `style-src 'nonce-…'` on every HTML response. The production build still disables **critical CSS / font inlining** (`optimization.styles.inlineCritical: false`, `optimization.fonts.inline: false`) to avoid extra inline `<style>` / `onload` in `index.html` and to keep **`script-src`** free of `'unsafe-inline'`. **`ThemeService`** uses **`adoptedStyleSheets`** for theme tokens so day-to-day theming does not rely on `element.style.setProperty`.
- **Cloud Functions** validate input length; callable `assistantAsk` uses **`enforceAppCheck: true`** (see `functions/src/index.ts`).
- Dependencies updated via **Dependabot**; **CodeQL** runs on default branches.

## Firebase App Check (reCAPTCHA Enterprise)

1. In **Google Cloud Console**, enable **reCAPTCHA Enterprise** for the project and create a **Web** key for the Hosting site origin(s).
2. In **Firebase Console → App Check**, register the **Web** app with the **reCAPTCHA Enterprise** provider using that site key.
3. Turn on **Enforcement** for **Cloud Firestore** and **Cloud Functions** (callable) once clients send valid tokens.
4. Fill `src/assets/config/firebase-public.json` at deploy time (or replace via your pipeline) with the Firebase web config fields and **`appCheckSiteKey`**. Do not commit real API keys in public forks; use CI secrets to generate this file for release builds only.
5. The SPA registers App Check via `@angular/fire` (`provideAppCheck` + `ReCaptchaEnterpriseProvider`) when `appCheckSiteKey` is non-empty (`src/app/firebase/firebase.providers.ts`).

**Local development:** leave `appCheckSiteKey` empty to skip App Check initialization, or use a [debug provider](https://firebase.google.com/docs/app-check/web/debug-provider) registered in the Firebase console for trusted machines.

**Firestore rules:** client reads are path-restricted in `firestore.rules`; App Check is additionally enforced at the **Firebase API** layer when enforcement is enabled in the console. Rules include an inline reminder next to the `contentPacks` match.

## Firebase Performance Monitoring

When a non-empty Firebase web config is present, the app registers **Performance Monitoring** through **`@angular/fire`** (`providePerformance` + `firebase/performance`) for real-user metrics and custom traces (for example timeline first render). Disable or strip in privacy-sensitive deployments if required by policy.

## Firebase Analytics (GA4)

When `measurementId` is non-empty in `src/assets/config/firebase-public.json`, the app registers **Google Analytics** via **`@angular/fire`** (`provideAnalytics`). **Collection is gated behind an in-app consent banner** (`PrivacyConsentService` + `ConsentBannerComponent`) aligned with India **DPDPA** expectations: users can decline analytics and still use the app; `setConsent` + `setAnalyticsCollectionEnabled` reflect the choice. Leave `measurementId` empty in environments where analytics must stay off.

## Google Cloud budget alerts

Budget export and alerting are **not** defined in this repository. In **Google Cloud Console → Billing → Budgets & alerts**, create at least one budget tied to the project (or billing account) with email or Pub/Sub notification channels and thresholds you are comfortable with, then confirm alerts in a test window.

## Visual regression (Percy)

Optional **Percy** snapshots run in CI when the repository secret `PERCY_TOKEN` is set (`percy` job in `.github/workflows/ci.yml`). Add `@percy/playwright` tests under `e2e/percy.spec.ts` and extend snapshots as the UI grows.
