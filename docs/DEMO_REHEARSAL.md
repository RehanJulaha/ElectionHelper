# Demo rehearsal

Follow [DEMO_SCRIPT.md](DEMO_SCRIPT.md) until fluent under 60 seconds.

## Offline backup

```bash
npm run build
npx http-server dist/epa/browser -p 8080
```

Open `http://127.0.0.1:8080` and run the same script (relative paths for `/assets/...` must match `base href`).

## Checks before presenting

- [ ] Contrast acceptable in **light** and **dark** theme.
- [ ] Keyboard: skip link, timeline arrows, glossary search.
- [ ] Hindi toggle updates visible strings and `lang` on `<html>`.
