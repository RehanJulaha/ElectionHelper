# WCAG 2.2 oriented checklist (manual)

See **`docs/A11Y_AUDIT.md`** for the recorded conformance position (WCAG 2.1 AA target), CI evidence, and audit log.

- [x] Every interactive control reachable by **Tab** and shows a visible **focus** ring (`:focus-visible`).
- [x] **Skip link** moves focus to `#main`.
- [x] **Landmarks:** `header`, `main`, `nav[role="navigation"]`, logical `h1`–`h3` order.
- [x] **Listbox** pattern: `role="listbox"`, options `aria-selected`, `aria-activedescendant` when focused container.
- [x] **Touch targets** at least 44×44 CSS px for primary buttons.
- [x] **Color contrast** for body text and CTA on light and dark themes (use theme tokens).
- [x] **`prefers-reduced-motion`:** no essential motion only in animation.
- [x] **Language:** `html[lang]` updates with Transloco active language.
- [x] Run **axe** in CI (`npm run e2e`) and fix serious/critical issues.
- [x] **Route changes:** programmatic focus moves to `#main` after in-app navigation (see `RouteFocusService`).
