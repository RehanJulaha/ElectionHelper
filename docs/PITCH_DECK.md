# Pitch deck outline — Election Process Assistant

1. **Title** — Election Process Assistant; tagline: Lok Sabha education, official sources first.
2. **Problem** — Voters and students struggle to see the **full election sequence** and role-specific actions; PDFs and portals are fragmented.
3. **Market** — ECI digital properties and SVEEP; gap: guided **timeline + citations** with accessibility and bilingual UX.
4. **Solution** — Interactive timeline, role switcher (voter / candidate / observer), glossary, sources drawer with **eci.gov.in** links only; content version in footer.
5. **Live demo** — 60 s path: scope label → phase → sources → Hindi toggle → glossary search.
6. **MVP** — Static curated pack + Firestore rules for published pack; optional Cloud Function for grounded assistant (Vertex behind IAM).
7. **USP** — Zod-validated pack, ECI-only URLs in schema, Firebase App Check–ready, 100+ automated tests (Vitest + Karma + Playwright/axe).
8. **Google Cloud** — Hosting, Firestore, Functions, Cloud Build, Secret Manager, Vertex (diagram: User → Hosting → Angular → Firestore → Functions → Vertex).
9. **Security & quality** — Security rules tests, CodeQL, Dependabot, CSP headers, no secrets in repo.
10. **Roadmap** — State assembly packs, Remote Config copy, App Check enforcement, Vertex-backed Q&A with citations.
11. **Team** — Roles: content/research, frontend, QA/DevOps, PM (adjust to your team).

**Presenter note:** Engineering workflow branded **Google Antigravity**; delivery tooling is Angular CLI + Firebase CLI + Cloud Build.
