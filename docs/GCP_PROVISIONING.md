# GCP and Firebase provisioning

1. Create a **GCP project** and link a **billing account** (credits).
2. In Firebase console, **Add Firebase** to the project; enable **Firestore** (native), **Hosting**, **Functions**, **App Check** (when ready).
3. Replace `YOUR_GCP_PROJECT_ID` in `.firebaserc` with your project id (do not commit secrets).
4. **IAM:** create a deploy service account with least privilege (`Firebase Admin`, `Cloud Build Editor`, etc.) and prefer **Workload Identity Federation** from GitHub Actions over long-lived JSON keys.
5. **Secret Manager:** store API keys / service-account JSON for **translate** and **Sheets** callables; bind via Firebase `defineSecret` (see `functions/src/index.ts`). **`assistantAsk`** uses **Vertex AI** with the function’s default service account (no API key secret): enable the **Vertex AI API** and grant the Cloud Functions runtime identity **`roles/aiplatform.user`** (models are called in **`asia-south1`** to match the callable region).
6. **Budgets:** Cloud Billing → Budgets → alert at 50% and 90% of a monthly cap.
7. **Cloud Build:** connect repository. `cloudbuild.yaml` maps Secret Manager secret **`firebase-ci-token`** to env **`FIREBASE_CI_TOKEN`** for the Firebase deploy step (`availableSecrets`). Create that secret in the same GCP project; use an empty secret version if you want CI to skip deploy while still running tests. Grant the Cloud Build service account **`roles/secretmanager.secretAccessor`** on `firebase-ci-token`.

## Firestore emulator rules tests

```bash
npm run test:firestore-rules
```

Requires Java runtime for the Firestore emulator (installed by `firebase-tools` on first use).
