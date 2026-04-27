# WCAG 2.2 oriented checklist (manual)

- [ ] Every interactive control reachable by **Tab** and shows a visible **focus** ring (`:focus-visible`).
- [ ] **Skip link** moves focus to `#main`.
- [ ] **Landmarks:** `header`, `main`, `nav[role="navigation"]`, logical `h1`–`h3` order.
- [ ] **Listbox** pattern: `role="listbox"`, options `aria-selected`, `aria-activedescendant` when focused container.
- [ ] **Touch targets** at least 44×44 CSS px for primary buttons.
- [ ] **Color contrast** for body text and CTA on light and dark themes (use theme tokens).
- [ ] **`prefers-reduced-motion`:** no essential motion only in animation.
- [ ] **Language:** `html[lang]` updates with Transloco active language.
- [ ] Run **axe** in CI (`npm run e2e`) and fix serious/critical issues.
