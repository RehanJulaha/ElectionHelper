# Architecture

## Client

- **Angular 19** SPA with `provideExperimentalZonelessChangeDetection`, standalone routes, lazy-loaded feature routes (`TimelineComponent`, `GlossaryPageComponent`).
- **State:** Angular signals in services (`ElectionPackService`, `ActiveRoleService`, `ThemeService`).
- **i18n:** `@ngneat/transloco` with JSON in `src/assets/i18n/`.
- **Content:** Curated pack JSON at `src/assets/content/india-lok-sabha.json`, validated at runtime with **Zod** (`src/lib/election/`).
- **Theming:** CSS variables from `src/assets/themes/theme.json`, applied by `ThemeService`.

## Backend (optional)

- **Cloud Functions (2nd gen)** in `functions/`: callables `assistantAsk` (**Vertex AI** Gemini via `@google-cloud/vertexai` + default compute credentials), `glossaryTranslate` (Cloud Translation API), `exportTimelineSheet` (Google Sheets). All use `enforceAppCheck: true`; translate and Sheets use **Secret Manager**–bound params (`defineSecret`). Grant the Functions runtime service account **`roles/aiplatform.user`** and enable the **Vertex AI API** for `assistantAsk`.
- **Firestore:** `contentPacks/india-lok-sabha-published` read-only from clients; rules in `firestore.rules`. The SPA can load this document when Remote Config `election_pack_channel` is `firestore` (see `ElectionPackService`).

## CI

- GitHub Actions: lint, Vitest coverage, Karma, Playwright, forbidden-path audit.
- Cloud Build (`cloudbuild.yaml`): install, test, build web and functions; optional deploy when substitutions are set.
