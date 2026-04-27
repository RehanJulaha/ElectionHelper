# Security policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` branch | Yes |

## Reporting a vulnerability

Do not open public issues for security problems. Contact maintainers through your organization’s private channel or GitHub **private vulnerability reporting** if enabled.

## Practices in this repository

- No API keys, service account JSON, or passwords in git.
- **Firestore Security Rules** deny all writes from the web client for MVP paths.
- **CSP** and security headers configured in `firebase.json` for Hosting.
- **Cloud Functions** must validate input length and attach **App Check** before production traffic.
- Dependencies updated via **Dependabot**; **CodeQL** runs on default branches.
