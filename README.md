# Election Process Assistant

Educational web application for **Lok Sabha (General Election)** in India: interactive timeline, role-based summaries, glossary, and official **Election Commission of India** source links. Built with **Angular 19** (standalone, zoneless, signals), **Firebase / Google Cloud** deployment targets, and **@ngneat/transloco** (English and Hindi).

Engineering workflow: **Google Antigravity**. Build entrypoints: **Angular CLI**, **Firebase CLI**, **Google Cloud Build** (`cloudbuild.yaml`).

## Commands

| Command | Purpose |
|--------|---------|
| `npm start` | Dev server |
| `npm run build` | Production build to `dist/epa/browser` |
| `npm run test:vitest` | Node tests (domain + Firestore rules when emulator env set) |
| `npm test` | Karma / Jasmine component and service tests |
| `npm run test:ci` | Vitest coverage + Karma headless |
| `npm run test:firestore-rules` | Firestore rules tests inside emulator |
| `npm run e2e` | Playwright + axe |
| `npm run lint` | ESLint |

## Firebase and GCP

1. Create a GCP project and enable **Firestore**, **Hosting**, **Cloud Functions**, **Cloud Build**, **Secret Manager**, **Vertex AI** as needed.
2. Copy `.env.example` to a **local** env file (not committed). Set `.firebaserc` `default` project id.
3. Deploy: `firebase deploy` or use **Cloud Build** with a CI token / WIF (see `docs/GCP_PROVISIONING.md`).

## Security

No secrets in the repository. Use **Secret Manager** and IAM. See [SECURITY.md](SECURITY.md).

## Accessibility

WCAG-oriented UI (keyboard, focus, landmarks, `aria-live`, reduced motion). Automated checks: Playwright + `@axe-core/playwright`. Manual checklist: [docs/A11Y_CHECKLIST.md](docs/A11Y_CHECKLIST.md).

## License

Private hackathon project unless otherwise stated.
