# Architecture

## Client

- **Angular 19** SPA with `provideExperimentalZonelessChangeDetection`, standalone routes, lazy-loaded feature routes (`TimelineComponent`, `GlossaryPageComponent`).
- **State:** Angular signals in services (`ElectionPackService`, `ActiveRoleService`, `ThemeService`).
- **i18n:** `@ngneat/transloco` with JSON in `src/assets/i18n/`.
- **Content:** Curated pack JSON at `src/assets/content/india-lok-sabha.json`, validated at runtime with **Zod** (`src/lib/election/`).
- **Theming:** CSS variables from `src/assets/themes/theme.json`, applied by `ThemeService`.

## Backend (optional)

- **Cloud Functions (2nd gen)** in `functions/`: callable `assistantAsk` stub (replace body with Vertex Gemini + Secret Manager as per ops runbook).
- **Firestore:** `contentPacks/india-lok-sabha-published` read-only from clients; rules in `firestore.rules`.

## CI

- GitHub Actions: lint, Vitest coverage, Karma, Playwright, forbidden-path audit.
- Cloud Build (`cloudbuild.yaml`): install, test, build web and functions; optional deploy when substitutions are set.
