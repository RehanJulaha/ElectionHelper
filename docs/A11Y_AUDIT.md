# Accessibility audit record

## Conformance position

This web application is engineered to meet **WCAG 2.1 Level AA** for the Lok Sabha education flows implemented in this repository (timeline, glossary, language and theme controls, and shell navigation). Automated checks target WCAG 2.0/2.1 A and AA rules via axe-core; manual verification follows `docs/A11Y_CHECKLIST.md`.

Conformance is **contextual**: third-party assets (e.g. Google Fonts), user-generated content, and future features must be re-audited when they ship.

## Evidence committed in CI

| Method | Scope | Where |
|--------|--------|--------|
| axe-core (Playwright) | Home and glossary routes, `wcag2a` + `wcag2aa` tags; serious/critical violations must be empty on home; critical empty on glossary | `e2e/app.spec.ts` |
| Manual checklist | Landmarks, skip link, focus order, motion, contrast, touch targets | `docs/A11Y_CHECKLIST.md` |

## Last recorded audit (repository)

| Date (UTC) | axe (e2e) | Notes |
|------------|-----------|--------|
| 2026-04-28 | Configured as above; run `npm run e2e` locally or in CI to refresh | Route focus after navigation implemented in `RouteFocusService`; see `e2e/app.spec.ts` for focus assertion |

Re-run Playwright after substantive UI changes and update the table row.

## Route focus

Angular does not move focus on route changes by default. This app uses `RouteFocusService` to focus `#main` (which has `tabindex="-1"`) after in-app navigations, with an exception for the first navigation to `/` so the skip link remains the first tab stop on cold load.

## Related documents

- `docs/A11Y_CHECKLIST.md` — manual WCAG-oriented checklist
- `README.md` — Accessibility summary
