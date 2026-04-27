# GCP and Firebase provisioning

1. Create a **GCP project** and link a **billing account** (credits).
2. In Firebase console, **Add Firebase** to the project; enable **Firestore** (native), **Hosting**, **Functions**, **App Check** (when ready).
3. Replace `YOUR_GCP_PROJECT_ID` in `.firebaserc` with your project id (do not commit secrets).
4. **IAM:** create a deploy service account with least privilege (`Firebase Admin`, `Cloud Build Editor`, etc.) and prefer **Workload Identity Federation** from GitHub Actions over long-lived JSON keys.
5. **Secret Manager:** store Vertex or third-party keys; mount into Functions via `secretEnvironmentVariables`.
6. **Budgets:** Cloud Billing → Budgets → alert at 50% and 90% of a monthly cap.
7. **Cloud Build:** connect repository; set substitution `_FIREBASE_CI_TOKEN` only in Secret Manager + Cloud Build triggers (not in git).

## Firestore emulator rules tests

```bash
npm run test:firestore-rules
```

Requires Java runtime for the Firestore emulator (installed by `firebase-tools` on first use).
