# Golden-path demo (60 seconds)

1. Open the app. Confirm header shows **Lok Sabha (General Election)** scope label.
2. Tab to **Skip to main content**; Enter. Focus lands on main timeline region.
3. Select phase **Polling day** with keyboard (Arrow keys if implemented, else Tab + Enter on step).
4. Open **Official sources**; confirm at least one `eci.gov.in` URL is listed.
5. Toggle **Candidate** role; confirm body text updates without full reload.
6. Open **Glossary** route; search **NOTA**; verify definition appears.
7. Toggle language **English / Hindi**; verify `lang` on `html` and visible strings switch.
8. Footer shows **content version** and **last reviewed** metadata.

Offline backup: run `npm run build` and serve `dist/epa/browser` with any static server; same path without Firebase.
