# Accessibility checklist and conformance notes

## WCAG 2.1 Level AA

This product **targets** WCAG **2.1 Level AA** for user-facing flows (timeline, glossary, navigation, language, and theme). A formal **conformance claim** or **VPAT** is not published in-repo; use this document plus automated checks as the evidence baseline.

## Automated verification (committed)

| Check | Location |
|-------|-----------|
| Playwright: skip link `href` → `#main` | `e2e/app.spec.ts` |
| Playwright: after client-side navigation, focus on `#main` | `e2e/app.spec.ts` |
| Playwright: `lang` on `<html>` when switching to Hindi | `e2e/app.spec.ts` |
| axe-core: home and glossary, WCAG 2.0 A + AA tags | `e2e/app.spec.ts` |
| Route focus service (programmatic focus after nav) | `src/app/services/route-focus.service.ts` |

## Lighthouse (performance / a11y / best-practices gates)

Score assertions are defined in `lighthouserc.json` and executed in CI via the **`lighthouse`** job in `.github/workflows/ci.yml` (`@lhci/cli autorun --config=./lighthouserc.json`).

## Manual audit log

| Date | Auditor | Scope | Result | Notes |
|------|---------|-------|--------|-------|
| 2026-04-28 | Engineering (self-audit) | Home, glossary, keyboard path, Hindi toggle | **Pass with documented automation** | Full manual WCAG audit not contracted; rely on axe + Playwright above and re-test after material UI changes. |

## Follow-up when UI changes

- Re-run `npm run e2e` and confirm focus order after any layout or landmark change.
- Re-run Lighthouse CI locally or in GitHub Actions after changes that affect rendering or client bundle size.
