# Election Process Assistant

[![CI](https://github.com/RehanJulaha/ElectionHelper/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/RehanJulaha/ElectionHelper/actions/workflows/ci.yml)
[![CodeQL](https://github.com/RehanJulaha/ElectionHelper/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/RehanJulaha/ElectionHelper/actions/workflows/codeql.yml)
[![Vitest lines ≥90%](https://img.shields.io/badge/Vitest%20%28src%2Flib%29-lines%20%E2%89%A5%2090%25-306998)](https://github.com/RehanJulaha/ElectionHelper/blob/main/vitest.config.ts)
[![Vitest branches ≥85%](https://img.shields.io/badge/branches%20%E2%89%A5%2085%25-306998)](https://github.com/RehanJulaha/ElectionHelper/blob/main/vitest.config.ts)

An **educational** single-page app for **India’s Lok Sabha (general election)** process: a step-by-step timeline, **role-based** copy (voter, candidate, observer), a searchable **glossary**, and links to **official Election Commission of India** sources. Content is informational only—users should always verify details with the ECI and their state CEO.

---

## Features

| Area | What you get |
|------|----------------|
| **Timeline** | Ordered phases with keyboard navigation, phase detail, and expandable “Official sources”. |
| **Roles** | Switch perspective to see voter-, candidate-, or observer-oriented summaries where copy differs. |
| **Glossary** | Filterable terms (e.g. NOTA, EPIC, RO, MCC) with English and Hindi strings via **Transloco**. |
| **Resilience** | Election pack JSON is **Zod-validated**, fetched with **retries**, and **cached in `localStorage`** for repeat visits and flaky networks. |
| **Theming** | Light/dark CSS variables loaded from `src/assets/themes/theme.json`. |
| **i18n** | **English** (`en`) and **Hindi** (`hi`); all user-facing strings go through **@ngneat/transloco**. |

---

## Tech stack

- **Angular 19** — standalone components, lazy routes, **zoneless** change detection (`provideExperimentalZonelessChangeDetection`), **signals** for state.
- **TypeScript 5.7** (strict), **RxJS 7**, **Zod** for runtime validation of bundled JSON packs.
- **Firebase** — Hosting (SPA rewrites + security headers), Firestore rules, optional Functions; see `firebase.json`.
- **Testing** — **Vitest** (domain logic under `src/lib/`), **Karma + Jasmine** (Angular units), **Playwright** + **axe-core** (e2e & accessibility smoke).
- **CI** — GitHub Actions (`lint`, production `ng build` bundle budgets, Vitest + coverage, Karma headless, Playwright + axe, Lighthouse CI gates, path guardrails, CodeQL).

---

## Prerequisites

- **Node.js 22** (matches CI; LTS-aligned versions usually work—use 22 for parity with GitHub Actions).
- **npm** 10+ (ships with Node 22).

Optional for deploys and rules tests:

- **Firebase CLI** (`npm i -g firebase-tools` or use `npx firebase`).
- **Chrome** (or Chromium) locally for `npm test` / `npm run test:ci` headless runs.

---

## Quick start

```bash
git clone https://github.com/RehanJulaha/ElectionHelper.git
cd ElectionHelper
npm ci
npm start
```

Open **http://localhost:4200/** — the dev server uses Angular’s default port unless you override it.

**Production build** (output used by Firebase Hosting):

```bash
npm run build
# Static files: dist/epa/browser
```

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm start` | Dev server (`ng serve`). |
| `npm run build` | Production build → `dist/epa/browser`. |
| `npm run lint` | ESLint (`ng lint`). |
| `npm test` | Karma + Jasmine, headless Chrome. |
| `npm run test:vitest` | Vitest (watch in TTY). |
| `npm run test:ci` | Vitest with coverage, then Karma headless (local CI parity). |
| `npm run test:vitest:rules` | Firestore rules unit tests (Vitest). |
| `npm run test:firestore-rules` | Same tests inside the **Firestore emulator** (`demo-epa` project alias). |
| `npm run e2e:install` | Install Playwright Chromium browser. |
| `npm run e2e` | Playwright suite (includes axe checks on key pages). |

---

## Testing & coverage

- **`src/lib/**`** — validated election helpers; covered by **Vitest** (`tests/unit/…`). Published gates: **lines ≥ 90%**, **statements ≥ 90%**, **functions ≥ 90%**, **branches ≥ 85%** (`vitest.config.ts`).
- **`src/app/**`** — components and services; covered by **Karma** when you run `npm test` / `npm run test:ci`.
- **E2E** — `e2e/` Playwright specs; run `npm run e2e:install` once per machine.

Firestore rules specs are **skipped** in plain Vitest unless you use the emulator wrapper script above.

---

## Deploy (Google Cloud Build → Firebase)

Production deploys run through **`cloudbuild.yaml`** (install → `ng build` → tests → Functions TypeScript build → **`firebase deploy`**). On pushes to **`main` / `master`**, GitHub Actions submits that build when **`GCP_SA_KEY`** is set (see `deploy-cloud-build` in `.github/workflows/ci.yml`).

### Why Hosting used to “not deploy” everything

- **Cloud Functions (2nd gen)** need the Firebase/GCP project on the **Blaze (pay-as-you-go)** plan and **Cloud Build** / **Artifact Registry** APIs. Without Blaze, `firebase deploy --only functions` fails.
- **Firestore rules** deploy needs the **Cloud Firestore API** enabled and a **Firestore database** created once in the console.

So **`cloudbuild.yaml` defaults `_FIREBASE_DEPLOY_MODE` to `hosting`** so Cloud Build can **ship the SPA reliably** even before Blaze/Firestore/Functions are ready. That is the “deployable on Google Cloud” baseline.

### Configure GCP + Firebase once

1. **`.firebaserc`** — `default` project id must match your Firebase project.
2. **Blaze billing** — required before adding `functions` to deploy targets ([Firebase usage](https://console.firebase.google.com/)).
3. **Secret Manager API** — required before first **`firebase deploy --only functions`** that uses `defineSecret` ([enable Secret Manager](https://console.developers.google.com/apis/api/secretmanager.googleapis.com/overview?project=election-helper-a3a4a)). If you see HTTP 403 on `secretmanager.googleapis.com`, this API is still off or IAM is blocking access.
4. **Firestore** — enable API + create database: [Firestore API](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview) (then add `firestore` to targets when ready).
5. **Deploy token for Cloud Build** — create Secret Manager secret **`firebase-ci-token`** (CI token from `firebase login:ci`; an empty version skips deploy but still runs build/tests). `cloudbuild.yaml` maps it to env **`FIREBASE_CI_TOKEN`** via `availableSecrets`. Grant the **Cloud Build** service account **`roles/secretmanager.secretAccessor`** on that secret.
6. **IAM** — the **Cloud Build service account** needs permission to run builds and to call **`firebase deploy`** for the targets you use (often **Firebase Admin** / **Service Usage** / **Cloud Functions Developer** as per your org).

### Choosing what gets deployed (`_FIREBASE_DEPLOY_MODE`)

Cloud Build uses a **mode** string (no commas — avoids `gcloud --substitutions` parsing issues):

| Mode | `firebase deploy --only` | When to use |
|------|---------------------------|-------------|
| `hosting` | `hosting` | **Default** — SPA only; works without Blaze. |
| `hosting-fs` | `hosting,firestore` | Firestore API + DB ready — publishes **rules**. |
| `full` | `hosting,firestore,functions` | **Blaze** + Function **Secret Manager** secrets — ships **callables**. |

**Manual submit:**

```bash
gcloud builds submit --config=cloudbuild.yaml --project=YOUR_PROJECT_ID \
  --substitutions=_FIREBASE_DEPLOY_MODE=full .
```

**GitHub Actions:** set repository variable **`FIREBASE_DEPLOY_MODE`** to `full` (or `hosting-fs`) when your project is ready; unset or `hosting` keeps **hosting-only** deploys.

**Local Firebase CLI (maintainers):**

```bash
npm run deploy:firebase:hosting    # SPA
npm run deploy:firebase:all        # hosting + firestore + functions (needs Blaze + secrets)
```

Callable backends: **`assistantAsk`** uses **Vertex AI** (default runtime credentials; enable Vertex AI API and grant **`roles/aiplatform.user`** to the Functions service account). **`glossaryTranslate`** and **`exportTimelineSheet`** read **Secret Manager** names via `defineSecret`: `GOOGLE_TRANSLATE_API_KEY`, `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`.

For broader GCP notes, see **`docs/GCP_PROVISIONING.md`**, **`docs/GCP_BUDGETS.md`**, **`docs/GCP_FIRESTORE_BOUNDARIES.md`**.

---

## Documentation

| Doc | Topic |
|-----|--------|
| [docs/SCOPE_LOK_SABHA.md](docs/SCOPE_LOK_SABHA.md) | Product scope for the Lok Sabha education pack. |
| [docs/A11Y_CHECKLIST.md](docs/A11Y_CHECKLIST.md) | Accessibility manual checklist. |
| [docs/A11Y_AUDIT.md](docs/A11Y_AUDIT.md) | WCAG 2.1 AA conformance position and audit log. |
| [docs/FIRESTORE_INDEXES.md](docs/FIRESTORE_INDEXES.md) | When to add composite indexes (currently none required). |
| [docs/adr/](docs/adr/) | Architecture decision records (ADRs). |
| [docs/GCP_PROVISIONING.md](docs/GCP_PROVISIONING.md) | Cloud / Firebase provisioning notes. |
| [SECURITY.md](SECURITY.md) | Secret handling and reporting. |

Pitch and demo collateral: `docs/PITCH_DECK.md`, `docs/DEMO_SCRIPT.md`, `docs/DEMO_REHEARSAL.md`.

---

## Security & configuration

- **Do not commit secrets.** Use environment variables or your cloud secret manager; see **`.env.example`** for non-sensitive placeholders only.
- Hosting applies **CSP**, **nosniff**, **Referrer-Policy**, and **Permissions-Policy** (see `firebase.json`).
- Details: **[SECURITY.md](SECURITY.md)**.

---

## Accessibility

Keyboard-first timeline (arrow keys, Home/End), landmarks, skip link, focus management on route changes, translated strings, and automated **axe** checks in Playwright. See **`docs/A11Y_AUDIT.md`** (conformance statement) and **`docs/A11Y_CHECKLIST.md`** (manual verification).

---

## Repository layout (high level)

```
src/
  app/           # Routes, shell, timeline & glossary features, services
  assets/        # i18n, themes, static election pack JSON
  lib/election/  # Zod schema, parsing, ordering, glossary helpers (Vitest)
tests/           # Vitest + Firestore rules tests
e2e/             # Playwright specs
functions/       # Firebase Cloud Functions (optional)
```

---

## Continuous integration

Workflows under **`.github/workflows/`**:

- **`ci.yml`** — lint, production build (bundle budgets), Vitest + coverage artifact, Karma, Playwright, Lighthouse CI (`lighthouserc.json`: accessibility ≥ 0.9, performance ≥ 0.8), and a guard that rejects accidental commits of local IDE tooling paths (see the `forbidden-paths` job).
- **`codeql.yml`** — CodeQL for JavaScript/TypeScript.
- **`dependabot.yml`** — Dependency update automation.

---

## License

Private / hackathon use unless otherwise stated by the repository owner.

---

## Acknowledgements

Educational content should be cross-checked with the **Election Commission of India** and official state election sites. Engineering workflow may use **Google Antigravity** alongside **Angular CLI**, **Firebase CLI**, and **Cloud Build** (`cloudbuild.yaml`) where applicable.
